import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { Achievement, AchievementType } from '../entities/Achievement';
import { AppError } from '../middlewares/errorMiddleware';
import { calculateLevel, calculatePointsInCurrentLevel, getNowUTC6 } from '../utils/helpers';
import { In } from 'typeorm';
import { logger } from '../utils/logger';
import { StreakService } from './streak.service';

export class PointsService {
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);
  private achievementRepository = AppDataSource.getRepository(Achievement);
  private streakService = new StreakService();

  async addPoints(userId: string, points: number, reason: string): Promise<User> {
    logger.info({ message: 'Adding points to user', userId, points, reason });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      logger.warn({ message: 'User not found for adding points', userId });
      throw new AppError(404, 'Usuario no encontrado');
    }

    const previousLevel = user.currentLevel;

    // Update points
    user.totalPoints += points;
    user.currentLevel = calculateLevel(user.totalPoints);
    user.pointsInCurrentLevel = calculatePointsInCurrentLevel(user.totalPoints);

    const updatedUser = await this.userRepository.save(user);
    logger.info({ message: 'Points added successfully', userId, points, newTotal: updatedUser.totalPoints, newLevel: updatedUser.currentLevel });

    // Create log
    await this.logRepository.save(
      this.logRepository.create({
        userId,
        type: LogType.POINTS_EARNED,
        message: reason,
        pointsChange: points,
      })
    );

    // Check for level up
    if (user.currentLevel > previousLevel) {
      logger.info({ message: 'User leveled up', userId, fromLevel: previousLevel, toLevel: user.currentLevel });
      await this.handleLevelUp(user, previousLevel);
    }

    // Check for achievements
    await this.checkAchievements(user);

    return updatedUser;
  }

  async deductPoints(userId: string, points: number, reason: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    if (user.totalPoints < points) {
      throw new AppError(400, 'Puntos insuficientes');
    }

    // Update points
    user.totalPoints -= points;
    user.currentLevel = calculateLevel(user.totalPoints);
    user.pointsInCurrentLevel = calculatePointsInCurrentLevel(user.totalPoints);

    await this.userRepository.save(user);

    // Create log
    await this.logRepository.save(
      this.logRepository.create({
        userId,
        type: LogType.POINTS_SPENT,
        message: reason,
        pointsChange: -points,
      })
    );

    return user;
  }

  async getPointsHistory(
    userId: string,
    filters?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ logs: Log[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    // Only show relevant log types in history
    const relevantLogTypes = [
      LogType.POINTS_EARNED,
      LogType.POINTS_SPENT,
      LogType.PERMISSION_REQUESTED,
      LogType.PERMISSION_APPROVED,
      LogType.PERMISSION_REJECTED,
      LogType.ACTION_CREATED,
      LogType.ACTION_APPROVED,
      LogType.ACTION_REJECTED,
    ];

    const [logs, total] = await this.logRepository.findAndCount({
      where: {
        userId,
        type: In(relevantLogTypes),
      },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { logs, total };
  }

  /**
   * Returns global leaderboard across all active users, ordered by total points.
   */
  async getLeaderboard(_requestingUserId: string, limit: number = 10): Promise<User[]> {
    return await this.userRepository.find({
      where: { isActive: true },
      order: { totalPoints: 'DESC' },
      take: limit,
      select: ['id', 'firstName', 'lastName', 'avatarUrl', 'totalPoints', 'currentLevel'],
    });
  }

  private async handleLevelUp(user: User, previousLevel: number): Promise<void> {
    // Create level up log
    await this.logRepository.save(
      this.logRepository.create({
        userId: user.id,
        type: LogType.LEVEL_UP,
        message: `¡Subiste de nivel! Nivel ${user.currentLevel} alcanzado`,
        metadata: {
          previousLevel,
          newLevel: user.currentLevel,
        },
      })
    );

    // Check for level milestone achievements
    await this.checkLevelAchievements(user);
  }

  /**
   * Called externally after a points-modifying transaction.
   * Re-computes the expected level from current points and triggers level-up
   * if the stored level is behind (possible when points were mutated outside addPoints).
   */
  async checkAchievementsForUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    // Re-derive current level from totalPoints in case it diverged
    const expectedLevel = calculateLevel(user.totalPoints);
    if (expectedLevel > user.currentLevel) {
      const previousLevel = user.currentLevel;
      user.currentLevel = expectedLevel;
      user.pointsInCurrentLevel = calculatePointsInCurrentLevel(user.totalPoints);
      await this.userRepository.save(user);
      await this.handleLevelUp(user, previousLevel);
    }

    await this.checkAchievements(user);
  }

  private achievementCopy(type: AchievementType, value: number): { title: string; description: string } {
    switch (type) {
      case AchievementType.POINTS_MILESTONE:
        return { title: `Maestro de ${value} Puntos`, description: `Ganaste ${value} puntos totales` };
      case AchievementType.LEVEL_MILESTONE:
        return { title: `Campeón Nivel ${value}`, description: `Alcanzaste el nivel ${value}` };
      case AchievementType.ACTIONS_COMPLETED:
        return value === 1
          ? { title: 'Primera Acción Completada', description: 'Completaste tu primera acción aprobada' }
          : { title: `${value} Acciones Completadas`, description: `Completaste ${value} acciones aprobadas` };
      case AchievementType.PERMISSIONS_GRANTED:
        return value === 1
          ? { title: 'Primer Permiso Otorgado', description: 'Obtuviste tu primer permiso aprobado' }
          : { title: `${value} Permisos Otorgados`, description: `Obtuviste ${value} permisos aprobados` };
      case AchievementType.STREAK:
        return value === 1
          ? { title: 'Racha de 1 Semana', description: 'Completaron acciones juntos esta semana' }
          : { title: `Racha de ${value} Semanas`, description: `Completaron acciones juntos ${value} semanas seguidas` };
      case AchievementType.SPECIAL:
        return { title: `Logro Especial ${value}`, description: `Logro especial ${value}` };
    }
  }

  private async checkAchievements(user: User): Promise<void> {
    // Single query for all unlocked achievements
    const unlockedAchievements = await this.achievementRepository.find({
      where: { userId: user.id, isUnlocked: true },
    });

    const unlockedKeys = new Set(
      unlockedAchievements.map((a) => `${a.type}_${a.requiredValue}`)
    );

    const [approvedActionsResult, approvedPermissionsResult, streakInfo] =
      await Promise.all([
        AppDataSource.query<[{ count: string }]>(
          `SELECT COUNT(*) AS count FROM actions WHERE "userId" = $1 AND status = 'approved'`,
          [user.id]
        ),
        AppDataSource.query<[{ count: string }]>(
          `SELECT COUNT(*) AS count FROM permissions WHERE "requesterId" = $1 AND status = 'approved'`,
          [user.id]
        ),
        this.streakService.getStreak(user.id).catch(() => null),
      ]);

    const approvedActions = parseInt(approvedActionsResult[0]?.count ?? '0');
    const approvedPermissions = parseInt(approvedPermissionsResult[0]?.count ?? '0');
    const currentStreak = streakInfo?.currentStreak ?? 0;

    const pointsMilestones = [250, 750, 1500, 3500, 7500];
    for (const milestone of pointsMilestones) {
      if (user.totalPoints >= milestone && !unlockedKeys.has(`${AchievementType.POINTS_MILESTONE}_${milestone}`)) {
        const copy = this.achievementCopy(AchievementType.POINTS_MILESTONE, milestone);
        await this.unlockAchievement(user.id, copy.title, copy.description, AchievementType.POINTS_MILESTONE, milestone);
      }
    }

    const actionsMilestones = [1, 5, 10, 25, 50, 100];
    for (const milestone of actionsMilestones) {
      if (approvedActions >= milestone && !unlockedKeys.has(`${AchievementType.ACTIONS_COMPLETED}_${milestone}`)) {
        const copy = this.achievementCopy(AchievementType.ACTIONS_COMPLETED, milestone);
        await this.unlockAchievement(user.id, copy.title, copy.description, AchievementType.ACTIONS_COMPLETED, milestone);
      } else if (approvedActions < milestone) {
        await this.updateProgress(user.id, AchievementType.ACTIONS_COMPLETED, milestone, approvedActions);
      }
    }

    const permissionsMilestones = [1, 5, 10, 25];
    for (const milestone of permissionsMilestones) {
      if (approvedPermissions >= milestone && !unlockedKeys.has(`${AchievementType.PERMISSIONS_GRANTED}_${milestone}`)) {
        const copy = this.achievementCopy(AchievementType.PERMISSIONS_GRANTED, milestone);
        await this.unlockAchievement(user.id, copy.title, copy.description, AchievementType.PERMISSIONS_GRANTED, milestone);
      } else if (approvedPermissions < milestone) {
        await this.updateProgress(user.id, AchievementType.PERMISSIONS_GRANTED, milestone, approvedPermissions);
      }
    }

    const streakMilestones = [2, 4, 8, 12];
    for (const milestone of streakMilestones) {
      if (currentStreak >= milestone && !unlockedKeys.has(`${AchievementType.STREAK}_${milestone}`)) {
        const copy = this.achievementCopy(AchievementType.STREAK, milestone);
        await this.unlockAchievement(user.id, copy.title, copy.description, AchievementType.STREAK, milestone);
      } else if (currentStreak < milestone) {
        await this.updateProgress(user.id, AchievementType.STREAK, milestone, currentStreak);
      }
    }
  }

  /**
   * Updates currentProgress on a locked achievement so the frontend progress bar is accurate.
   * Creates the achievement row if it doesn't exist yet.
   */
  private async updateProgress(
    userId: string,
    type: AchievementType,
    requiredValue: number,
    currentProgress: number
  ): Promise<void> {
    const existing = await this.achievementRepository.findOne({
      where: { userId, type, requiredValue },
    });

    if (existing) {
      if (!existing.isUnlocked && existing.currentProgress !== currentProgress) {
        existing.currentProgress = currentProgress;
        await this.achievementRepository.save(existing);
      }
    } else {
      // Seed the locked achievement row so the frontend can show progress
      const copy = this.achievementCopy(type, requiredValue);
      await this.achievementRepository.save(
        this.achievementRepository.create({
          userId,
          type,
          title: copy.title,
          description: copy.description,
          isUnlocked: false,
          requiredValue,
          currentProgress,
        })
      );
    }
  }

  private async checkLevelAchievements(user: User): Promise<void> {
    const levelMilestones = [5, 10, 25, 50, 100];

    for (const milestone of levelMilestones) {
      if (user.currentLevel >= milestone) {
        const existingAchievement = await this.achievementRepository.findOne({
          where: {
            userId: user.id,
            type: AchievementType.LEVEL_MILESTONE,
            requiredValue: milestone,
          },
        });

        if (!existingAchievement || !existingAchievement.isUnlocked) {
          const copy = this.achievementCopy(AchievementType.LEVEL_MILESTONE, milestone);
          await this.unlockAchievement(
            user.id,
            copy.title,
            copy.description,
            AchievementType.LEVEL_MILESTONE,
            milestone
          );
        }
      }
    }
  }

  private async unlockAchievement(
    userId: string,
    title: string,
    description: string,
    type: AchievementType,
    requiredValue?: number
  ): Promise<void> {
    // Check for existing to avoid duplicate — DB unique constraint is safety net
    const existing = await this.achievementRepository.findOne({
      where: { userId, type, requiredValue: requiredValue ?? null as unknown as number },
    });
    if (existing?.isUnlocked) return;

    const achievement = existing
      ? Object.assign(existing, { isUnlocked: true, unlockedAt: getNowUTC6() })
      : this.achievementRepository.create({
          userId,
          title,
          description,
          type,
          isUnlocked: true,
          unlockedAt: getNowUTC6(),
          pointsReward: 50,
          requiredValue,
          currentProgress: requiredValue || 0,
        });

    await this.achievementRepository.save(achievement);

    // Add bonus points
    // TODO: Temporarily disabled - uncomment to re-enable bonus points for achievements
    // await this.addPoints(userId, 50, `Logro desbloqueado: ${title}`);

    // Create log
    await this.logRepository.save(
      this.logRepository.create({
        userId,
        type: LogType.ACHIEVEMENT_UNLOCKED,
        message: `Logro desbloqueado: ${title}`,
        pointsChange: 0, // TODO: Changed from 50 to 0 while bonus points are disabled
        relatedEntityId: achievement.id,
        relatedEntityType: 'Achievement',
      })
    );
  }
}

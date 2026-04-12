import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { Achievement, AchievementType } from '../entities/Achievement';
import { AppError } from '../middlewares/errorMiddleware';
import { calculateLevel, calculatePointsInCurrentLevel, getNowUTC6 } from '../utils/helpers';
import { In } from 'typeorm';
import { logger } from '../utils/logger';

export class PointsService {
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);
  private achievementRepository = AppDataSource.getRepository(Achievement);

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
   * Returns leaderboard scoped to the requesting user's couple (user + partner only).
   * App is couple-scoped — exposing all users' points would violate data isolation.
   */
  async getLeaderboard(requestingUserId: string, limit: number = 10): Promise<User[]> {
    // Find the active partner link to get both user IDs
    const partnerLinkRepo = AppDataSource.getRepository(
      (await import('../entities/PartnerLink')).PartnerLink
    );
    const { PartnerLinkStatus } = await import('../entities/PartnerLink');

    const partnerLink = await partnerLinkRepo.findOne({
      where: [
        { user1Id: requestingUserId, status: PartnerLinkStatus.ACTIVE },
        { user2Id: requestingUserId, status: PartnerLinkStatus.ACTIVE },
      ],
    });

    // If no partner, only show the requesting user
    const coupleMemberIds = partnerLink
      ? [partnerLink.user1Id, partnerLink.user2Id]
      : [requestingUserId];

    return await this.userRepository.find({
      where: coupleMemberIds.map((id) => ({ id, isActive: true })),
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

  private async checkAchievements(user: User): Promise<void> {
    // Single query for all unlocked achievements
    const unlockedAchievements = await this.achievementRepository.find({
      where: { userId: user.id, isUnlocked: true },
    });

    const unlockedKeys = new Set(
      unlockedAchievements.map((a) => `${a.type}_${a.requiredValue}`)
    );

    // Parallel DB queries for counts and streak dates
    const [approvedActionsResult, approvedPermissionsResult, streakDatesResult] =
      await Promise.all([
        AppDataSource.query<[{ count: string }]>(
          `SELECT COUNT(*) AS count FROM actions WHERE "userId" = $1 AND status = 'approved'`,
          [user.id]
        ),
        AppDataSource.query<[{ count: string }]>(
          `SELECT COUNT(*) AS count FROM permissions WHERE "requesterId" = $1 AND status = 'approved'`,
          [user.id]
        ),
        AppDataSource.query<Array<{ day: string }>>(
          `SELECT DISTINCT DATE("approvedAt") AS day
           FROM actions
           WHERE "userId" = $1 AND status = 'approved' AND "approvedAt" IS NOT NULL
           ORDER BY day DESC
           LIMIT 31`,
          [user.id]
        ),
      ]);

    const approvedActions = parseInt(approvedActionsResult[0]?.count ?? '0');
    const approvedPermissions = parseInt(approvedPermissionsResult[0]?.count ?? '0');
    const currentStreak = this.computeStreak(streakDatesResult.map((r) => r.day));

    // Points milestones
    const pointsMilestones = [100, 500, 1000, 5000, 10000];
    for (const milestone of pointsMilestones) {
      if (user.totalPoints >= milestone && !unlockedKeys.has(`${AchievementType.POINTS_MILESTONE}_${milestone}`)) {
        await this.unlockAchievement(user.id, `Maestro de ${milestone} Puntos`, `Ganaste ${milestone} puntos totales`, AchievementType.POINTS_MILESTONE, milestone);
      }
    }

    // Actions completed milestones
    const actionsMilestones = [5, 10, 25, 50, 100];
    for (const milestone of actionsMilestones) {
      if (approvedActions >= milestone && !unlockedKeys.has(`${AchievementType.ACTIONS_COMPLETED}_${milestone}`)) {
        await this.unlockAchievement(user.id, `${milestone} Acciones Completadas`, `Completaste ${milestone} acciones aprobadas`, AchievementType.ACTIONS_COMPLETED, milestone);
      } else if (approvedActions < milestone) {
        await this.updateProgress(user.id, AchievementType.ACTIONS_COMPLETED, milestone, approvedActions);
      }
    }

    // Permissions granted milestones
    const permissionsMilestones = [1, 5, 10, 25];
    for (const milestone of permissionsMilestones) {
      if (approvedPermissions >= milestone && !unlockedKeys.has(`${AchievementType.PERMISSIONS_GRANTED}_${milestone}`)) {
        await this.unlockAchievement(user.id, `${milestone} Permiso${milestone > 1 ? 's' : ''} Otorgado${milestone > 1 ? 's' : ''}`, `Obtuviste ${milestone} permisos aprobados`, AchievementType.PERMISSIONS_GRANTED, milestone);
      } else if (approvedPermissions < milestone) {
        await this.updateProgress(user.id, AchievementType.PERMISSIONS_GRANTED, milestone, approvedPermissions);
      }
    }

    // Streak milestones (consecutive days with approved actions)
    const streakMilestones = [3, 7, 14, 30];
    for (const milestone of streakMilestones) {
      if (currentStreak >= milestone && !unlockedKeys.has(`${AchievementType.STREAK}_${milestone}`)) {
        await this.unlockAchievement(user.id, `Racha de ${milestone} Días`, `Tuviste acciones aprobadas ${milestone} días seguidos`, AchievementType.STREAK, milestone);
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
      const titles: Record<AchievementType, (v: number) => string> = {
        [AchievementType.POINTS_MILESTONE]: (v) => `Maestro de ${v} Puntos`,
        [AchievementType.LEVEL_MILESTONE]: (v) => `Campeón Nivel ${v}`,
        [AchievementType.ACTIONS_COMPLETED]: (v) => `${v} Acciones Completadas`,
        [AchievementType.PERMISSIONS_GRANTED]: (v) => `${v} Permiso${v > 1 ? 's' : ''} Otorgado${v > 1 ? 's' : ''}`,
        [AchievementType.STREAK]: (v) => `Racha de ${v} Días`,
        [AchievementType.SPECIAL]: (v) => `Logro Especial ${v}`,
      };
      const descriptions: Record<AchievementType, (v: number) => string> = {
        [AchievementType.POINTS_MILESTONE]: (v) => `Gana ${v} puntos totales`,
        [AchievementType.LEVEL_MILESTONE]: (v) => `Alcanza el nivel ${v}`,
        [AchievementType.ACTIONS_COMPLETED]: (v) => `Completa ${v} acciones aprobadas`,
        [AchievementType.PERMISSIONS_GRANTED]: (v) => `Obtén ${v} permisos aprobados`,
        [AchievementType.STREAK]: (v) => `Mantén una racha de ${v} días seguidos`,
        [AchievementType.SPECIAL]: (v) => `Logro especial ${v}`,
      };

      await this.achievementRepository.save(
        this.achievementRepository.create({
          userId,
          type,
          title: titles[type](requiredValue),
          description: descriptions[type](requiredValue),
          isUnlocked: false,
          requiredValue,
          currentProgress,
        })
      );
    }
  }

  /**
   * Computes consecutive day streak from a DESC-ordered list of ISO date strings.
   * Streak starts from today or yesterday (to allow end-of-day submissions).
   */
  private computeStreak(descDays: string[]): number {
    if (descDays.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().slice(0, 10);

    // Streak must include today or yesterday
    if (descDays[0] !== todayStr && descDays[0] !== yesterdayStr) return 0;

    let streak = 1;
    for (let i = 1; i < descDays.length; i++) {
      const prev = new Date(descDays[i - 1] + 'T00:00:00Z');
      const curr = new Date(descDays[i] + 'T00:00:00Z');
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
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
          await this.unlockAchievement(
            user.id,
            `Campeón Nivel ${milestone}`,
            `Alcanzaste el nivel ${milestone}`,
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

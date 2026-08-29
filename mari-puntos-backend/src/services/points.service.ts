import { In } from 'typeorm';

import { AppDataSource } from '../config/db';
import { Achievement, AchievementType } from '../entities/Achievement';
import { Log, LogType } from '../entities/Log';
import { User } from '../entities/User';
import { getAchievementCopy, translate } from '../i18n';
import {
  calculateLevel,
  calculatePointsInCurrentLevel,
  getNowUTC6,
} from '../utils/helpers';
import { StreakService } from './streak.service';

export class PointsService {
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);
  private achievementRepository = AppDataSource.getRepository(Achievement);
  private streakService = new StreakService();

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

  async getLeaderboard(_requestingUserId: string, limit: number = 10): Promise<User[]> {
    return await this.userRepository.find({
      where: { isActive: true },
      order: { totalPoints: 'DESC' },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        totalPoints: true,
        currentLevel: true,
      },
    });
  }

  private async handleLevelUp(user: User, previousLevel: number): Promise<void> {
    await this.logRepository.save(
      this.logRepository.create({
        userId: user.id,
        type: LogType.LEVEL_UP,
        message: translate('logs.levelUp', user.locale, { level: user.currentLevel }),
        metadata: {
          previousLevel,
          newLevel: user.currentLevel,
        },
      })
    );

    await this.checkLevelAchievements(user);
  }

  async checkAchievementsForUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

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

  private achievementCopy(
    type: AchievementType,
    value: number,
    locale?: string | null
  ): { title: string; description: string } {
    return getAchievementCopy(type, value, locale);
  }

  private async checkAchievements(user: User): Promise<void> {
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
      if (
        user.totalPoints >= milestone &&
        !unlockedKeys.has(`${AchievementType.POINTS_MILESTONE}_${milestone}`)
      ) {
        const copy = this.achievementCopy(
          AchievementType.POINTS_MILESTONE,
          milestone,
          user.locale
        );
        await this.unlockAchievement(
          user.id,
          copy.title,
          copy.description,
          AchievementType.POINTS_MILESTONE,
          milestone,
          user.locale
        );
      }
    }

    const actionsMilestones = [1, 5, 10, 25, 50, 100];
    for (const milestone of actionsMilestones) {
      if (
        approvedActions >= milestone &&
        !unlockedKeys.has(`${AchievementType.ACTIONS_COMPLETED}_${milestone}`)
      ) {
        const copy = this.achievementCopy(
          AchievementType.ACTIONS_COMPLETED,
          milestone,
          user.locale
        );
        await this.unlockAchievement(
          user.id,
          copy.title,
          copy.description,
          AchievementType.ACTIONS_COMPLETED,
          milestone,
          user.locale
        );
      } else if (approvedActions < milestone) {
        await this.updateProgress(
          user.id,
          AchievementType.ACTIONS_COMPLETED,
          milestone,
          approvedActions,
          user.locale
        );
      }
    }

    const permissionsMilestones = [1, 5, 10, 25];
    for (const milestone of permissionsMilestones) {
      if (
        approvedPermissions >= milestone &&
        !unlockedKeys.has(`${AchievementType.PERMISSIONS_GRANTED}_${milestone}`)
      ) {
        const copy = this.achievementCopy(
          AchievementType.PERMISSIONS_GRANTED,
          milestone,
          user.locale
        );
        await this.unlockAchievement(
          user.id,
          copy.title,
          copy.description,
          AchievementType.PERMISSIONS_GRANTED,
          milestone,
          user.locale
        );
      } else if (approvedPermissions < milestone) {
        await this.updateProgress(
          user.id,
          AchievementType.PERMISSIONS_GRANTED,
          milestone,
          approvedPermissions,
          user.locale
        );
      }
    }

    const streakMilestones = [2, 4, 8, 12];
    for (const milestone of streakMilestones) {
      if (
        currentStreak >= milestone &&
        !unlockedKeys.has(`${AchievementType.STREAK}_${milestone}`)
      ) {
        const copy = this.achievementCopy(AchievementType.STREAK, milestone, user.locale);
        await this.unlockAchievement(
          user.id,
          copy.title,
          copy.description,
          AchievementType.STREAK,
          milestone,
          user.locale
        );
      } else if (currentStreak < milestone) {
        await this.updateProgress(
          user.id,
          AchievementType.STREAK,
          milestone,
          currentStreak,
          user.locale
        );
      }
    }
  }

  private async updateProgress(
    userId: string,
    type: AchievementType,
    requiredValue: number,
    currentProgress: number,
    locale?: string | null
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
      const copy = this.achievementCopy(type, requiredValue, locale);
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
          const copy = this.achievementCopy(
            AchievementType.LEVEL_MILESTONE,
            milestone,
            user.locale
          );
          await this.unlockAchievement(
            user.id,
            copy.title,
            copy.description,
            AchievementType.LEVEL_MILESTONE,
            milestone,
            user.locale
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
    requiredValue?: number,
    locale?: string | null
  ): Promise<void> {
    const existing = await this.achievementRepository.findOne({
      where: {
        userId,
        type,
        requiredValue: requiredValue ?? (null as unknown as number),
      },
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

    await this.logRepository.save(
      this.logRepository.create({
        userId,
        type: LogType.ACHIEVEMENT_UNLOCKED,
        message: translate('logs.achievementUnlocked', locale, { title }),
        pointsChange: 0,
        relatedEntityId: achievement.id,
        relatedEntityType: 'Achievement',
      })
    );
  }
}

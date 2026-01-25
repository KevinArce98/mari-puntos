import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { Achievement, AchievementType } from '../entities/Achievement';
import { AppError } from '../middlewares/errorMiddleware';
import {
  calculateLevel,
  calculatePointsInCurrentLevel,
} from '../utils/helpers';

export class PointsService {
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);
  private achievementRepository = AppDataSource.getRepository(Achievement);

  async addPoints(userId: string, points: number, reason: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const previousLevel = user.currentLevel;

    // Update points
    user.totalPoints += points;
    user.currentLevel = calculateLevel(user.totalPoints);
    user.pointsInCurrentLevel = calculatePointsInCurrentLevel(user.totalPoints);

    await this.userRepository.save(user);

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
      await this.handleLevelUp(user, previousLevel);
    }

    // Check for achievements
    await this.checkAchievements(user);

    return user;
  }

  async deductPoints(userId: string, points: number, reason: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.totalPoints < points) {
      throw new AppError(400, 'Insufficient points');
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

    const [logs, total] = await this.logRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { logs, total };
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return await this.userRepository.find({
      where: { isActive: true },
      order: { totalPoints: 'DESC' },
      take: limit,
      select: [
        'id',
        'firstName',
        'lastName',
        'avatarUrl',
        'totalPoints',
        'currentLevel',
        'role',
      ],
    });
  }

  private async handleLevelUp(user: User, previousLevel: number): Promise<void> {
    // Create level up log
    await this.logRepository.save(
      this.logRepository.create({
        userId: user.id,
        type: LogType.LEVEL_UP,
        message: `Level up! Reached level ${user.currentLevel}`,
        metadata: {
          previousLevel,
          newLevel: user.currentLevel,
        },
      })
    );

    // Check for level milestone achievements
    await this.checkLevelAchievements(user);
  }

  private async checkAchievements(user: User): Promise<void> {
    // Get user's unlocked achievements
    const unlockedAchievements = await this.achievementRepository.find({
      where: { userId: user.id, isUnlocked: true },
    });

    const unlockedTypes = new Set(unlockedAchievements.map((a) => `${a.type}_${a.requiredValue}`));

    // Check points milestones
    const pointsMilestones = [100, 500, 1000, 5000, 10000];
    for (const milestone of pointsMilestones) {
      const achievementKey = `${AchievementType.POINTS_MILESTONE}_${milestone}`;
      if (user.totalPoints >= milestone && !unlockedTypes.has(achievementKey)) {
        await this.unlockAchievement(
          user.id,
          `${milestone} Points Master`,
          `Earned ${milestone} total points`,
          AchievementType.POINTS_MILESTONE,
          milestone
        );
      }
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
          await this.unlockAchievement(
            user.id,
            `Level ${milestone} Champion`,
            `Reached level ${milestone}`,
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
    const achievement = this.achievementRepository.create({
      userId,
      title,
      description,
      type,
      isUnlocked: true,
      unlockedAt: new Date(),
      pointsReward: 50,
      requiredValue,
      currentProgress: requiredValue || 0,
    });

    await this.achievementRepository.save(achievement);

    // Add bonus points
    await this.addPoints(userId, 50, `Achievement unlocked: ${title}`);

    // Create log
    await this.logRepository.save(
      this.logRepository.create({
        userId,
        type: LogType.ACHIEVEMENT_UNLOCKED,
        message: `Achievement unlocked: ${title}`,
        pointsChange: 50,
        relatedEntityId: achievement.id,
        relatedEntityType: 'Achievement',
      })
    );
  }
}

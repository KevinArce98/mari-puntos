import { AppDataSource } from '../config/db';
import { calculateLevel, calculatePointsInCurrentLevel } from '../utils/helpers';
import { DeepPartial } from 'typeorm';
import { Reward, RewardCategory } from '../entities/Reward';
import { User } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { AppError } from '../middlewares/errorMiddleware';
import { CreateRewardInput, UpdateRewardInput } from '../validators/schemas';
import { logger } from '../utils/logger';

export class RewardsService {
  private rewardRepository = AppDataSource.getRepository(Reward);
  private userRepository = AppDataSource.getRepository(User);

  async createReward(userId: string, data: CreateRewardInput): Promise<Reward> {
    logger.info({ message: 'Creating reward', userId, rewardData: data });

    // Get user's partner link
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['partnerLinkAsUser1', 'partnerLinkAsUser2'],
    });

    if (!user) {
      logger.warn({ message: 'User not found for reward creation', userId });
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Get the partner link ID (either as user1 or user2)
    const partnerLink = user.partnerLinkAsUser1 || user.partnerLinkAsUser2;
    const partnerLinkId = partnerLink?.id || undefined;

    const reward = this.rewardRepository.create({
      title: data.title,
      description: data.description,
      category: data.category as RewardCategory,
      pointsCost: data.pointsCost,
      requiredLevel: data.requiredLevel,
      imageUrl: data.imageUrl,
      createdBy: userId,
      partnerLinkId,
      isCustom: true,
    });

    const savedReward = await this.rewardRepository.save(reward);
    logger.info({ message: 'Reward created successfully', userId, rewardId: savedReward.id });

    return savedReward;
  }

  async getRewardById(rewardId: string): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new AppError(404, 'Recompensa no encontrada');
    }

    return reward;
  }

  async getAllRewards(filters?: {
    category?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    userId?: string; // Used to filter by user's partner link
  }): Promise<{ rewards: Reward[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.rewardRepository
      .createQueryBuilder('reward')
      .orderBy('reward.pointsCost', 'ASC')
      .skip(skip)
      .take(limit);

    // If userId is provided, filter by partner link
    if (filters?.userId) {
      const user = await this.userRepository.findOne({
        where: { id: filters.userId },
        relations: ['partnerLinkAsUser1', 'partnerLinkAsUser2'],
      });

      if (user) {
        const partnerLink = user.partnerLinkAsUser1 || user.partnerLinkAsUser2;
        const partnerLinkId = partnerLink?.id;

        // Show global rewards (partnerLinkId IS NULL) OR rewards from user's couple
        queryBuilder.andWhere(
          '(reward.partnerLinkId IS NULL OR reward.partnerLinkId = :partnerLinkId)',
          { partnerLinkId: partnerLinkId || 'no-partner' }
        );
      }
    }

    if (filters?.category) {
      queryBuilder.andWhere('reward.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('reward.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    const [rewards, total] = await queryBuilder.getManyAndCount();

    return { rewards, total };
  }

  async getAvailableRewards(userId: string): Promise<Reward[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['partnerLinkAsUser1', 'partnerLinkAsUser2'],
    });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    const partnerLink = user.partnerLinkAsUser1 || user.partnerLinkAsUser2;
    const partnerLinkId = partnerLink?.id;

    // Get all active rewards that user can afford, has required level, and belong to their couple or are global
    const queryBuilder = this.rewardRepository
      .createQueryBuilder('reward')
      .where('reward.isActive = :isActive', { isActive: true })
      .andWhere('reward.pointsCost <= :points', { points: user.totalPoints })
      .andWhere('(reward.requiredLevel IS NULL OR reward.requiredLevel <= :level)', {
        level: user.currentLevel,
      })
      .andWhere(
        '(reward.partnerLinkId IS NULL OR reward.partnerLinkId = :partnerLinkId)',
        { partnerLinkId: partnerLinkId || 'no-partner' }
      )
      .orderBy('reward.pointsCost', 'ASC');

    const rewards = await queryBuilder.getMany();

    return rewards;
  }

  async redeemReward(userId: string, rewardId: string): Promise<void> {
    const reward = await this.getRewardById(rewardId);

    if (!reward.isActive) {
      throw new AppError(400, 'La recompensa no está activa');
    }

    await AppDataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const rewardRepo = manager.getRepository(Reward);
      const logRepo = manager.getRepository(Log);

      // Pessimistic lock to prevent concurrent redeem races
      const user = await userRepo.findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new AppError(404, 'Usuario no encontrado');
      if (user.totalPoints < reward.pointsCost) throw new AppError(400, 'Puntos insuficientes');
      if (reward.requiredLevel && user.currentLevel < reward.requiredLevel) {
        throw new AppError(400, 'No cumples con el nivel requerido');
      }

      user.totalPoints -= reward.pointsCost;
      user.currentLevel = calculateLevel(user.totalPoints);
      user.pointsInCurrentLevel = calculatePointsInCurrentLevel(user.totalPoints);
      await userRepo.save(user);

      reward.timesRedeemed += 1;
      await rewardRepo.save(reward);

      await logRepo.save(
        logRepo.create({
          userId,
          type: LogType.REWARD_REDEEMED,
          message: `Recompensa canjeada: ${reward.title}`,
          pointsChange: -reward.pointsCost,
          relatedEntityId: reward.id,
          relatedEntityType: 'Reward',
        })
      );
    });
  }

  async updateReward(rewardId: string, data: UpdateRewardInput): Promise<Reward> {
    const reward = await this.getRewardById(rewardId);

    if (data.title !== undefined) reward.title = data.title;
    if (data.description !== undefined) reward.description = data.description;
    if (data.category !== undefined) reward.category = data.category as RewardCategory;
    if (data.pointsCost !== undefined) reward.pointsCost = data.pointsCost;
    if (data.requiredLevel !== undefined) reward.requiredLevel = data.requiredLevel;
    if (data.imageUrl !== undefined) reward.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) reward.isActive = data.isActive;

    await this.rewardRepository.save(reward);

    return reward;
  }

  async deleteReward(rewardId: string): Promise<void> {
    const reward = await this.getRewardById(rewardId);

    if (reward.timesRedeemed > 0) {
      // Don't delete, just deactivate
      reward.isActive = false;
      await this.rewardRepository.save(reward);
    } else {
      await this.rewardRepository.remove(reward);
    }
  }

  async seedDefaultRewards(): Promise<void> {
    const defaultRewards = [
      {
        title: 'Gaming Night (2 hours)',
        description: 'Enjoy 2 hours of uninterrupted gaming time',
        category: 'personal_time',
        pointsCost: 50,
        requiredLevel: 1,
        isCustom: false,
      },
      {
        title: 'Night Out with Friends',
        description: 'A night out with the guys',
        category: 'entertainment',
        pointsCost: 150,
        requiredLevel: 3,
        isCustom: false,
      },
      {
        title: 'Sports Event Ticket',
        description: 'Attend a live sports event',
        category: 'entertainment',
        pointsCost: 200,
        requiredLevel: 5,
        isCustom: false,
      },
      {
        title: 'Weekend Golf Trip',
        description: 'A full day of golf with friends',
        category: 'experiences',
        pointsCost: 300,
        requiredLevel: 10,
        isCustom: false,
      },
      {
        title: 'New Gaming Console',
        description: 'Redeem for a new gaming console',
        category: 'gifts',
        pointsCost: 1000,
        requiredLevel: 20,
        isCustom: false,
      },
    ];

    for (const rewardData of defaultRewards) {
      const exists = await this.rewardRepository.findOne({
        where: { title: rewardData.title },
      });

      if (!exists) {
        const reward = this.rewardRepository.create(rewardData as DeepPartial<Reward>);
        await this.rewardRepository.save(reward);
      }
    }
  }
}

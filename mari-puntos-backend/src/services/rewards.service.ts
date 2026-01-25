import { AppDataSource } from '../config/db';
import { Reward, RewardCategory } from '../entities/Reward';
import { User } from '../entities/User';
import { Log, LogType } from '../entities/Log';
import { AppError } from '../middlewares/errorMiddleware';
import { PointsService } from './points.service';
import { CreateRewardInput, UpdateRewardInput } from '../validators/schemas';

export class RewardsService {
  private rewardRepository = AppDataSource.getRepository(Reward);
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);
  private pointsService = new PointsService();

  async createReward(userId: string, data: CreateRewardInput): Promise<Reward> {
    const reward = this.rewardRepository.create({
      title: data.title,
      description: data.description,
      category: data.category as RewardCategory,
      pointsCost: data.pointsCost,
      requiredLevel: data.requiredLevel,
      imageUrl: data.imageUrl,
      createdBy: userId,
      isCustom: true,
    });

    await this.rewardRepository.save(reward);

    return reward;
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
  }): Promise<{ rewards: Reward[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.rewardRepository
      .createQueryBuilder('reward')
      .orderBy('reward.pointsCost', 'ASC')
      .skip(skip)
      .take(limit);

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
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    // Get all active rewards that user can afford and has required level
    const rewards = await this.rewardRepository
      .createQueryBuilder('reward')
      .where('reward.isActive = :isActive', { isActive: true })
      .andWhere('reward.pointsCost <= :points', { points: user.totalPoints })
      .andWhere(
        '(reward.requiredLevel IS NULL OR reward.requiredLevel <= :level)',
        { level: user.currentLevel }
      )
      .orderBy('reward.pointsCost', 'ASC')
      .getMany();

    return rewards;
  }

  async redeemReward(userId: string, rewardId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'Usuario no encontrado');
    }

    const reward = await this.getRewardById(rewardId);

    if (!reward.isActive) {
      throw new AppError(400, 'La recompensa no está activa');
    }

    if (user.totalPoints < reward.pointsCost) {
      throw new AppError(400, 'Puntos insuficientes');
    }

    if (reward.requiredLevel && user.currentLevel < reward.requiredLevel) {
      throw new AppError(400, 'No cumples con el nivel requerido');
    }

    // Deduct points
    await this.pointsService.deductPoints(
      userId,
      reward.pointsCost,
      `Recompensa canjeada: ${reward.title}`
    );

    // Update reward stats
    reward.timesRedeemed += 1;
    await this.rewardRepository.save(reward);

    // Create log
    await this.logRepository.save(
      this.logRepository.create({
        userId,
        type: LogType.REWARD_REDEEMED,
        message: `Recompensa canjeada: ${reward.title}`,
        pointsChange: -reward.pointsCost,
        relatedEntityId: reward.id,
        relatedEntityType: 'Reward',
      })
    );
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
        const reward = this.rewardRepository.create(rewardData as any);
        await this.rewardRepository.save(reward);
      }
    }
  }
}

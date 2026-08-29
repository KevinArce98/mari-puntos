import { In } from 'typeorm';

import { AppDataSource } from '../config/db';
import { Log, LogType } from '../entities/Log';
import { User } from '../entities/User';

export class PointsService {
  private userRepository = AppDataSource.getRepository(User);
  private logRepository = AppDataSource.getRepository(Log);

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
}

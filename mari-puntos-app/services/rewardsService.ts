import {
  ApiResponse,
  CreateRewardRequest,
  GetRewardsParams,
  PaginatedResponse,
  RedeemRewardRequest,
  Reward,
} from '@/types';

import { apiService } from './api';

class RewardsService {
  /**
   * Create custom reward
   * POST /rewards
   */
  async createReward(data: CreateRewardRequest): Promise<Reward> {
    const response = await apiService.post<ApiResponse<Reward>>('/rewards', data);
    return response.data;
  }

  /**
   * Get all rewards
   * GET /rewards
   */
  async getRewards(params?: GetRewardsParams): Promise<PaginatedResponse<Reward>> {
    return apiService.get<PaginatedResponse<Reward>>('/rewards', params);
  }

  /**
   * Get rewards available for current user (based on points and level)
   * GET /rewards/available
   */
  async getAvailableRewards(): Promise<Reward[]> {
    const response = await apiService.get<ApiResponse<Reward[]>>('/rewards/available');
    return response.data;
  }

  /**
   * Redeem a reward
   * POST /rewards/redeem
   */
  async redeemReward(data: RedeemRewardRequest): Promise<void> {
    await apiService.post<ApiResponse<void>>('/rewards/redeem', data);
  }
}

export const rewardsService = new RewardsService();

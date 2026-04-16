import {
  ApiResponse,
  GetLeaderboardParams,
  GetPointsHistoryParams,
  LeaderboardEntry,
  PaginatedResponse,
  PointsLog,
} from '@/types';

import { apiService } from './api';

class PointsService {
  /**
   * Get points history
   * GET /points/history
   */
  async getPointsHistory(
    params?: GetPointsHistoryParams
  ): Promise<PaginatedResponse<PointsLog>> {
    return apiService.get<PaginatedResponse<PointsLog>>('/points/history', params);
  }

  /**
   * Get points leaderboard
   * GET /points/leaderboard
   */
  async getLeaderboard(params?: GetLeaderboardParams): Promise<LeaderboardEntry[]> {
    const response = await apiService.get<ApiResponse<LeaderboardEntry[]>>(
      '/points/leaderboard',
      params
    );
    return response.data;
  }
}

export const pointsService = new PointsService();

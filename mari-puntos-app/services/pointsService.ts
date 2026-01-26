import { apiService } from './api';
import {
  ApiResponse,
  PaginatedResponse,
  PointsLog,
  GetPointsHistoryParams,
  LeaderboardEntry,
  GetLeaderboardParams,
} from '@/types';

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

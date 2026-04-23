import { GetPointsHistoryParams, PaginatedResponse, PointsLog } from '@/types';

import { apiService } from './api';

class PointsService {
  async getPointsHistory(
    params?: GetPointsHistoryParams
  ): Promise<PaginatedResponse<PointsLog>> {
    return apiService.get<PaginatedResponse<PointsLog>>('/points/history', params);
  }
}

export const pointsService = new PointsService();

import { ApiResponse } from '@/types';

import { apiService } from './api';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  currentWeekId: string;
  myWeekDone: boolean;
  partnerWeekDone: boolean;
  bothDoneThisWeek: boolean;
}

class StreakService {
  async getStreak(): Promise<StreakInfo> {
    const response = await apiService.get<ApiResponse<StreakInfo>>('/streak');
    return response.data;
  }
}

export const streakService = new StreakService();

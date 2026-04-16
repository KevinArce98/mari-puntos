import { create } from 'zustand';

import { pointsService } from '@/services';
import {
  GetLeaderboardParams,
  GetPointsHistoryParams,
  LeaderboardEntry,
  PointsLog,
} from '@/types';
import { getErrorMessage } from '@/utils/errorMessage';
import logger from '@/utils/logger';

interface PointsState {
  pointsHistory: PointsLog[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;

  // Actions
  fetchPointsHistory: (
    params?: GetPointsHistoryParams,
    append?: boolean
  ) => Promise<void>;
  fetchLeaderboard: (params?: GetLeaderboardParams) => Promise<void>;
  clearPoints: () => void;
}

export const usePointsStore = create<PointsState>((set) => ({
  pointsHistory: [],
  leaderboard: [],
  isLoading: false,
  error: null,
  paginationMeta: null,

  fetchPointsHistory: async (params, append = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await pointsService.getPointsHistory(params);
      set((state) => ({
        pointsHistory: append
          ? [...state.pointsHistory, ...response.data]
          : response.data,
        paginationMeta: response.pagination,
        isLoading: false,
      }));
      logger.debug('Points history fetched successfully', {
        count: response.data.length,
        append,
        params,
      });
    } catch (error: unknown) {
      logger.error('Failed to fetch points history', error as Error, { params, append });
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  fetchLeaderboard: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const leaderboard = await pointsService.getLeaderboard(params);
      set({ leaderboard, isLoading: false });
      logger.debug('Leaderboard fetched successfully', {
        count: leaderboard.length,
        params,
      });
    } catch (error: unknown) {
      logger.error('Failed to fetch leaderboard', error as Error, { params });
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  clearPoints: () =>
    set({ pointsHistory: [], leaderboard: [], paginationMeta: null, error: null }),
}));

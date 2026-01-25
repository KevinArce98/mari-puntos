import { create } from 'zustand';
import { pointsService } from '@/services';
import {
  PointsLog,
  GetPointsHistoryParams,
  LeaderboardEntry,
  GetLeaderboardParams,
} from '@/types';

interface PointsState {
  pointsHistory: PointsLog[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPointsHistory: (params?: GetPointsHistoryParams) => Promise<void>;
  fetchLeaderboard: (params?: GetLeaderboardParams) => Promise<void>;
  clearPoints: () => void;
}

export const usePointsStore = create<PointsState>((set) => ({
  pointsHistory: [],
  leaderboard: [],
  isLoading: false,
  error: null,

  fetchPointsHistory: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await pointsService.getPointsHistory(params);
      set({ pointsHistory: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to fetch points history', isLoading: false });
      throw error;
    }
  },

  fetchLeaderboard: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const leaderboard = await pointsService.getLeaderboard(params);
      set({ leaderboard, isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to fetch leaderboard', isLoading: false });
      throw error;
    }
  },

  clearPoints: () => set({ pointsHistory: [], leaderboard: [], error: null }),
}));

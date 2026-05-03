import { create } from 'zustand';

import { StreakInfo, streakService } from '@/services/streakService';
import { getErrorMessage } from '@/utils/errorMessage';
import logger from '@/utils/logger';

interface StreakState {
  streak: StreakInfo | null;
  isLoading: boolean;
  error: string | null;
  fetchStreak: () => Promise<void>;
  clearStreak: () => void;
}

export const useStreakStore = create<StreakState>((set) => ({
  streak: null,
  isLoading: false,
  error: null,

  fetchStreak: async () => {
    set({ isLoading: true, error: null });
    try {
      const streak = await streakService.getStreak();
      set({ streak, isLoading: false });
      logger.debug('Streak fetched', { currentStreak: streak.currentStreak });
    } catch (error: unknown) {
      logger.error('Failed to fetch streak', error as Error);
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  clearStreak: () => set({ streak: null, error: null }),
}));

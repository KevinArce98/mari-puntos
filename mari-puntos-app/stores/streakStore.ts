import { create } from 'zustand';

import { StreakInfo, streakService } from '@/services/streakService';
import { getErrorMessage } from '@/utils/errorMessage';

interface StreakState {
  streak: StreakInfo | null;
  isLoading: boolean;
  error: string | null;
  fetchStreak: () => Promise<void>;
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
    } catch (error: unknown) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },
}));

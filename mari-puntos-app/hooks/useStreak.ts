import { useEffect, useRef } from 'react';

import { AppState, AppStateStatus } from 'react-native';

import { useUserStore } from '@/stores';
import { useStreakStore } from '@/stores/streakStore';
import logger from '@/utils/logger';

export const useStreak = () => {
  const { streak, isLoading, error, fetchStreak } = useStreakStore();
  const { user } = useUserStore();
  const appState = useRef(AppState.currentState);

  // Initial fetch when user loads
  useEffect(() => {
    if (!user) return;
    fetchStreak().catch((err) => {
      logger.error('Failed to fetch streak on mount', err);
    });
  }, [user?.id]);

  // Refetch whenever the app comes back to the foreground
  useEffect(() => {
    if (!user) return;

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (appState.current !== 'active' && nextState === 'active') {
          fetchStreak().catch((err) => {
            logger.error('Failed to fetch streak on foreground', err);
          });
        }
        appState.current = nextState;
      }
    );

    return () => subscription.remove();
  }, [user?.id]);

  return { streak, isLoading, error, refetch: fetchStreak };
};

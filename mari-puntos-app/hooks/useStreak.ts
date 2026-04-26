import { useEffect } from 'react';

import { useUserStore } from '@/stores';
import { useStreakStore } from '@/stores/streakStore';
import logger from '@/utils/logger';

export const useStreak = () => {
  const { streak, isLoading, error, fetchStreak } = useStreakStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (!user) return;
    fetchStreak().catch((err) => {
      logger.error('Failed to fetch streak', err);
    });
  }, [user?.id]);

  return { streak, isLoading, error, refetch: fetchStreak };
};

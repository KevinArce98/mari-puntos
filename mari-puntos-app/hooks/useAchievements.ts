import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Achievement } from '@/types';
import { userService } from '@/services';
import { useUserStore } from '@/stores';
import logger from '@/utils/logger';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore((state) => state.user);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAchievements();
      setAchievements(data);
    } catch (err: unknown) {
      const message = (err as { error?: string })?.error ?? 'Error al cargar logros';
      setError(message);
      logger.error('Failed to fetch achievements', err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchAchievements();
    }, [fetchAchievements])
  );

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);

  return {
    achievements,
    unlockedAchievements,
    lockedAchievements,
    isLoading,
    error,
    refetch: fetchAchievements,
  };
};

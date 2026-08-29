import { useCallback } from 'react';

import { useFocusEffect } from 'expo-router';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { userService } from '@/services';
import { useUserStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorMessage';

export const useAchievements = () => {
  const user = useUserStore((state) => state.user);

  const query = useQuery({
    queryKey: queryKeys.user.achievements(),
    queryFn: () => userService.getAchievements(),
    enabled: !!user,
  });

  useFocusEffect(
    useCallback(() => {
      if (user) query.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  const achievements = query.data ?? [];

  return {
    achievements,
    unlockedAchievements: achievements.filter((a) => a.isUnlocked),
    lockedAchievements: achievements.filter((a) => !a.isUnlocked),
    isLoading: query.isLoading,
    error: query.error ? getErrorMessage(query.error) : null,
    refetch: async () => {
      await query.refetch();
    },
  };
};

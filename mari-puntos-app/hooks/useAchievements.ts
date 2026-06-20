import { useCallback } from 'react';

import { useFocusEffect } from 'expo-router';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { userService } from '@/services';
import { useUserStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorMessage';

/**
 * Achievements data, backed by React Query.
 *
 * Reference implementation for the React Query migration: the public API is
 * unchanged (achievements / unlocked / locked / isLoading / error / refetch),
 * so consuming screens need no changes. Caching + dedup + focus refetch are now
 * handled by React Query instead of ad-hoc component state.
 */
export const useAchievements = () => {
  const user = useUserStore((state) => state.user);

  const query = useQuery({
    queryKey: queryKeys.user.achievements(),
    queryFn: () => userService.getAchievements(),
    enabled: !!user,
  });

  // Preserve previous behavior: refresh when the screen regains focus.
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

import { useCallback } from 'react';

import { useFocusEffect } from 'expo-router';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { permissionsService } from '@/services';
import { useUserStore } from '@/stores';
import { getErrorMessage } from '@/utils/errorMessage';

export const useTemplates = () => {
  const user = useUserStore((state) => state.user);

  const query = useQuery({
    queryKey: queryKeys.permissions.templates(),
    queryFn: async () => {
      const result = await permissionsService.getTemplates();
      return result.data ?? [];
    },
    enabled: !!user,
  });

  useFocusEffect(
    useCallback(() => {
      if (user) query.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  return {
    templates: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error) : null,
    refetch: async () => {
      await query.refetch();
    },
  };
};

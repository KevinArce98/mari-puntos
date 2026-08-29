import { queryKeys } from '@/lib/queryKeys';
import { pointsService } from '@/services';
import { useUserStore } from '@/stores';

import { useInfiniteList } from './useInfiniteList';

export const usePointsHistory = (options?: { limit?: number }) => {
  const user = useUserStore((s) => s.user);
  const limit = options?.limit ?? 20;

  const list = useInfiniteList({
    queryKey: queryKeys.points.history({ limit }),
    fetchPage: ({ page }) => pointsService.getPointsHistory({ page, limit }),
    enabled: !!user,
    limit,
  });

  return {
    pointsHistory: list.items,
    pagination: list.pagination,
    isLoading: list.isLoading,
    isFetchingNextPage: list.isFetchingNextPage,
    hasNextPage: list.hasNextPage,
    error: list.error,
    loadMore: list.loadMore,
    refetch: list.refetch,
  };
};

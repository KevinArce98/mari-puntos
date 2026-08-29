import { useCallback } from 'react';

import { useFocusEffect } from 'expo-router';

import { type QueryKey, useInfiniteQuery } from '@tanstack/react-query';

import type { PaginatedResponse } from '@/types';
import { getErrorMessage } from '@/utils/errorMessage';

interface PageParams {
  page: number;
  limit: number;
}

interface UseInfiniteListArgs<T> {
  queryKey: QueryKey;
  fetchPage: (params: PageParams) => Promise<PaginatedResponse<T>>;
  enabled?: boolean;
  limit?: number;
}

export function useInfiniteList<T>({
  queryKey,
  fetchPage,
  enabled = true,
  limit = 20,
}: UseInfiniteListArgs<T>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled,
  });

  useFocusEffect(
    useCallback(() => {
      if (enabled) query.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled])
  );

  return {
    items: query.data?.pages.flatMap((page) => page.data) ?? [],
    pagination: query.data?.pages.at(-1)?.pagination ?? null,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    error: query.error ? getErrorMessage(query.error) : null,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
    refetch: async () => {
      await query.refetch();
    },
  };
}

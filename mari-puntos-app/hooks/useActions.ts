import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { actionsService } from '@/services';
import { useUserStore } from '@/stores';
import { ActionStatus, CreateActionRequest } from '@/types';

import { useInfiniteList } from './useInfiniteList';

interface UseActionsOptions {
  myStatus?: ActionStatus | null;
}

export const useActions = (options?: UseActionsOptions) => {
  const user = useUserStore((s) => s.user);
  const queryClient = useQueryClient();
  const myStatus = options?.myStatus ?? undefined;

  const mine = useInfiniteList({
    queryKey: queryKeys.actions.mine({ status: myStatus }),
    fetchPage: ({ page, limit }) =>
      actionsService.getMyActions({ page, limit, status: myStatus }),
    enabled: !!user,
  });

  const partner = useInfiniteList({
    queryKey: queryKeys.actions.partner(),
    fetchPage: ({ page, limit }) => actionsService.getPartnerActions({ page, limit }),
    enabled: !!user?.hasPartner,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.actions.all });

  const createAction = async (data: CreateActionRequest) => {
    await actionsService.createAction(data);
    await invalidate();
  };

  const approveAction = async (actionId: string, pointsAwarded: number) => {
    await actionsService.approveAction(actionId, { pointsAwarded });
    await invalidate();
    useUserStore
      .getState()
      .fetchStats()
      .catch(() => {});
  };

  const rejectAction = async (actionId: string, rejectionReason: string) => {
    await actionsService.rejectAction(actionId, { rejectionReason });
    await invalidate();
    useUserStore
      .getState()
      .fetchStats()
      .catch(() => {});
  };

  return {
    myActions: mine.items,
    partnerActions: partner.items,
    myActionsPagination: mine.pagination,
    partnerActionsPagination: partner.pagination,
    isLoading: mine.isLoading || partner.isLoading,
    error: mine.error ?? partner.error,
    isFetchingMoreMyActions: mine.isFetchingNextPage,
    isFetchingMorePartnerActions: partner.isFetchingNextPage,
    hasMoreMyActions: mine.hasNextPage,
    hasMorePartnerActions: partner.hasNextPage,
    loadMoreMyActions: mine.loadMore,
    loadMorePartnerActions: partner.loadMore,
    createAction,
    approveAction,
    rejectAction,
    refetchMyActions: mine.refetch,
    refetchPartnerActions: partner.refetch,
  };
};

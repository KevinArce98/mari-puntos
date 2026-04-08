import { useEffect } from 'react';
import { useActionsStore, useUserStore } from '@/stores';
import { CreateActionRequest, GetActionsParams } from '@/types';
import logger from '@/utils/logger';

export const useActions = () => {
  const {
    myActions,
    partnerActions,
    isLoading,
    error,
    myActionsPagination,
    partnerActionsPagination,
    fetchMyActions,
    fetchPartnerActions,
    createAction,
    approveAction,
    rejectAction,
  } = useActionsStore();
  const { user } = useUserStore();

  useEffect(() => {
    // Only fetch actions if user is loaded (ensures token is available)
    if (!user) return;

    fetchMyActions().catch((error) => {
      logger.error('Failed to fetch my actions in useActions hook', error);
    });
    fetchPartnerActions().catch((error) => {
      logger.error('Failed to fetch partner actions in useActions hook', error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCreateAction = async (data: CreateActionRequest) => {
    await createAction(data);
  };

  const handleApproveAction = async (actionId: string, pointsAwarded: number) => {
    await approveAction(actionId, pointsAwarded);
  };

  const handleRejectAction = async (actionId: string, rejectionReason: string) => {
    await rejectAction(actionId, rejectionReason);
  };

  const fetchPartnerActionsForReview = async (
    params?: GetActionsParams,
    append = false
  ) => {
    await fetchPartnerActions(params, append);
  };

  return {
    myActions,
    partnerActions,
    isLoading,
    error,
    myActionsPagination,
    partnerActionsPagination,
    createAction: handleCreateAction,
    approveAction: handleApproveAction,
    rejectAction: handleRejectAction,
    fetchPartnerActions: fetchPartnerActionsForReview,
    refetchMyActions: fetchMyActions,
    refetchPartnerActions: fetchPartnerActions,
  };
};

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
    if (!user) return;

    // Guard: skip if a fetch is already in flight (prevents double-fetch from
    // multiple consumers of this hook mounting simultaneously)
    const store = useActionsStore.getState();
    if (!store.isLoadingMyActions) {
      fetchMyActions().catch((error) => {
        logger.error('Failed to fetch my actions in useActions hook', error);
      });
    }
    if (user.hasPartner && !store.isLoadingPartnerActions) {
      fetchPartnerActions().catch((error) => {
        logger.error('Failed to fetch partner actions in useActions hook', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.hasPartner]);

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

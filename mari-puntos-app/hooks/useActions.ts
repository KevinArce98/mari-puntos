import { useEffect } from 'react';
import { useActionsStore } from '@/stores';
import { CreateActionRequest, GetActionsParams } from '@/types';
import logger from '@/utils/logger';

export const useActions = () => {
  const {
    myActions,
    partnerActions,
    isLoading,
    error,
    fetchMyActions,
    fetchPartnerActions,
    createAction,
    approveAction,
    rejectAction,
  } = useActionsStore();

  useEffect(() => {
    fetchMyActions().catch((error) => {
      logger.error('Failed to fetch my actions in useActions hook', error);
    });
    fetchPartnerActions().catch((error) => {
      logger.error('Failed to fetch partner actions in useActions hook', error);
    });
  }, []);

  const handleCreateAction = async (data: CreateActionRequest) => {
    await createAction(data);
  };

  const handleApproveAction = async (actionId: string, pointsAwarded: number) => {
    await approveAction(actionId, pointsAwarded);
  };

  const handleRejectAction = async (actionId: string, rejectionReason: string) => {
    await rejectAction(actionId, rejectionReason);
  };

  const fetchPartnerActionsForReview = async (params?: GetActionsParams) => {
    await fetchPartnerActions(params);
  };

  return {
    myActions,
    partnerActions,
    isLoading,
    error,
    createAction: handleCreateAction,
    approveAction: handleApproveAction,
    rejectAction: handleRejectAction,
    fetchPartnerActions: fetchPartnerActionsForReview,
    refetchMyActions: fetchMyActions,
    refetchPartnerActions: fetchPartnerActions,
  };
};

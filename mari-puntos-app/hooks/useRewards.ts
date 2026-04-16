import { useEffect } from 'react';

import { useRewardsStore, useUserStore } from '@/stores';
import { CreateRewardRequest, GetRewardsParams } from '@/types';
import logger from '@/utils/logger';

export const useRewards = () => {
  const {
    allRewards,
    availableRewards,
    isLoading,
    error,
    fetchAllRewards,
    fetchAvailableRewards,
    createReward,
    redeemReward,
  } = useRewardsStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (!user) return;
    fetchAvailableRewards().catch((error) => {
      logger.error('Failed to fetch available rewards', error);
    });
  }, [user?.id]);

  const handleCreateReward = async (data: CreateRewardRequest) => {
    await createReward(data);
  };

  const handleRedeemReward = async (rewardId: string) => {
    await redeemReward(rewardId);
  };

  const loadAllRewards = async (params?: GetRewardsParams) => {
    await fetchAllRewards(params);
  };

  return {
    allRewards,
    availableRewards,
    isLoading,
    error,
    createReward: handleCreateReward,
    redeemReward: handleRedeemReward,
    fetchAllRewards: loadAllRewards,
    refetchAvailable: fetchAvailableRewards,
  };
};

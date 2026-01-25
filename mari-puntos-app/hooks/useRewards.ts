import { useEffect } from 'react';
import { useRewardsStore } from '@/stores';
import { CreateRewardRequest, GetRewardsParams } from '@/types';

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

  useEffect(() => {
    fetchAvailableRewards().catch(console.error);
  }, []);

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

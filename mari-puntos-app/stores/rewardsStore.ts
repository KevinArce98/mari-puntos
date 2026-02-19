import { create } from 'zustand';
import { rewardsService } from '@/services';
import { Reward, CreateRewardRequest, GetRewardsParams } from '@/types';

interface RewardsState {
  allRewards: Reward[];
  availableRewards: Reward[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllRewards: (params?: GetRewardsParams) => Promise<void>;
  fetchAvailableRewards: () => Promise<void>;
  createReward: (data: CreateRewardRequest) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
  clearRewards: () => void;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  allRewards: [],
  availableRewards: [],
  isLoading: false,
  error: null,

  fetchAllRewards: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await rewardsService.getRewards(params);
      set({ allRewards: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to fetch rewards', isLoading: false });
      throw error;
    }
  },

  fetchAvailableRewards: async () => {
    set({ isLoading: true, error: null });
    try {
      const rewards = await rewardsService.getAvailableRewards();
      set({ availableRewards: rewards, isLoading: false });
    } catch (error: any) {
      set({
        error: error.error || 'Failed to fetch available rewards',
        isLoading: false,
      });
      throw error;
    }
  },

  createReward: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await rewardsService.createReward(data);
      // Refetch all rewards
      await get().fetchAllRewards();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to create reward', isLoading: false });
      throw error;
    }
  },

  redeemReward: async (rewardId) => {
    set({ isLoading: true, error: null });
    try {
      await rewardsService.redeemReward({ rewardId });
      // Refetch available rewards
      await get().fetchAvailableRewards();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to redeem reward', isLoading: false });
      throw error;
    }
  },

  clearRewards: () => set({ allRewards: [], availableRewards: [], error: null }),
}));

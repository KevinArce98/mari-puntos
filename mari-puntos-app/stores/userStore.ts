import { userService } from '@/services';
import {
  GetPartnerLinkCodeResponse,
  PartnerInfo,
  UpdateProfileRequest,
  User,
  UserStats,
} from '@/types';
import { create } from 'zustand';

interface UserState {
  user: User | null;
  stats: UserStats | null;
  partnerInfo: PartnerInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchPartnerInfo: () => Promise<PartnerInfo | null>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  createPartnerLink: () => Promise<string>;
  getPartnerLinkCode: () => Promise<GetPartnerLinkCodeResponse | null>;
  joinPartnerLink: (linkCode: string) => Promise<void>;
  clearUser: () => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  stats: null,
  partnerInfo: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  setError: (error) => set({ error }),

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.getProfile();
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to fetch profile', isLoading: false });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      const stats = await userService.getStats();
      set({ stats });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  },

  fetchPartnerInfo: async () => {
    try {
      const partnerInfo = await userService.getPartnerInfo();
      set({ partnerInfo });
      return partnerInfo;
    } catch (error: any) {
      console.error('Error fetching partner info:', error);
      set({ partnerInfo: null });
      return null;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateProfile(data);
      set({ user: updatedUser, isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to update profile', isLoading: false });
      throw error;
    }
  },

  createPartnerLink: async () => {
    set({ error: null });
    try {
      const response = await userService.createPartnerLink();
      return response.linkCode;
    } catch (error: any) {
      set({ error: error.error || 'Failed to create partner link', isLoading: false });
      throw error;
    }
  },

  getPartnerLinkCode: async () => {
    try {
      const response = await userService.getPartnerLinkCode();
      return response;
    } catch (error: any) {
      console.error('Error fetching partner link code:', error);
      return null;
    }
  },

  joinPartnerLink: async (linkCode: string) => {
    set({ isLoading: true, error: null });
    try {
      await userService.joinPartnerLink({ linkCode });
      // Refetch user and partner info
      await get().fetchProfile();
      await get().fetchPartnerInfo();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.error || 'Failed to join partner link', isLoading: false });
      throw error;
    }
  },

  clearUser: () => set({ user: null, stats: null, partnerInfo: null, error: null }),
}));

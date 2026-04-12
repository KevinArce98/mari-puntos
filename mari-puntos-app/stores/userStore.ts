import { userService } from '@/services';
import {
  GetPartnerLinkCodeResponse,
  PartnerInfo,
  UpdateProfileRequest,
  User,
  UserStats,
} from '@/types';
import { create } from 'zustand';
import logger from '@/utils/logger';
import { getErrorMessage } from '@/utils/errorMessage';

interface UserState {
  user: User | null;
  stats: UserStats | null;
  partnerInfo: PartnerInfo | null;
  isLoading: boolean;
  isProfileReady: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchPartnerInfo: () => Promise<PartnerInfo | null>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updatePushToken: (pushToken: string) => Promise<void>;
  createPartnerLink: () => Promise<string>;
  getPartnerLinkCode: () => Promise<GetPartnerLinkCodeResponse | null>;
  joinPartnerLink: (linkCode: string) => Promise<void>;
  unlinkPartner: () => Promise<void>;
  clearUser: () => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  stats: null,
  partnerInfo: null,
  isLoading: false,
  isProfileReady: false,
  error: null,

  setUser: (user) => set({ user }),

  setError: (error) => set({ error }),

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.getProfile();
      set({ user, isLoading: false, isProfileReady: true });
      logger.debug('User profile fetched successfully', { userId: user.id });
    } catch (error: unknown) {
      logger.error('Failed to fetch user profile', error as Error);
      set({
        error: getErrorMessage(error),
        isLoading: false,
        isProfileReady: true,
      });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      const stats = await userService.getStats();
      set({ stats });
      logger.debug('User stats fetched successfully', { totalPoints: stats.totalPoints });
    } catch (error: unknown) {
      logger.error('Failed to fetch user stats', error as Error);
    }
  },

  fetchPartnerInfo: async () => {
    try {
      const partnerInfo = await userService.getPartnerInfo();
      set({ partnerInfo });
      logger.debug('Partner info fetched successfully', { hasPartner: !!partnerInfo });
      return partnerInfo;
    } catch (error: unknown) {
      logger.error('Failed to fetch partner info', error as Error);
      set({ partnerInfo: null });
      return null;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateProfile(data);
      set({ user: updatedUser, isLoading: false });
      logger.info('User profile updated successfully', { userId: updatedUser.id });
    } catch (error: unknown) {
      logger.error('Failed to update user profile', error as Error, { data });
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  updatePushToken: async (pushToken) => {
    try {
      const updatedUser = await userService.updatePushToken(pushToken);
      set({ user: updatedUser });
      logger.info('Push token updated successfully');
    } catch (error: unknown) {
      logger.error('Failed to update push token', error as Error);
      throw error;
    }
  },

  createPartnerLink: async () => {
    set({ error: null });
    try {
      const response = await userService.createPartnerLink();
      logger.info('Partner link created successfully', { linkCode: response.linkCode });
      return response.linkCode;
    } catch (error: unknown) {
      logger.error('Failed to create partner link', error as Error);
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  getPartnerLinkCode: async () => {
    try {
      const response = await userService.getPartnerLinkCode();
      logger.debug('Partner link code fetched successfully');
      return response;
    } catch (error: unknown) {
      logger.error('Failed to fetch partner link code', error as Error);
      return null;
    }
  },

  joinPartnerLink: async (linkCode: string) => {
    set({ error: null });
    try {
      await userService.joinPartnerLink({ linkCode });
      logger.info('Successfully joined partner link', { linkCode });
      // Fetch silently — don't set isLoading to avoid unmounting the navigator in AuthGuard
      const [user, partnerInfo] = await Promise.all([
        userService.getProfile(),
        userService.getPartnerInfo().catch(() => null),
      ]);
      set({ user, partnerInfo });
    } catch (error: unknown) {
      logger.error('Failed to join partner link', error as Error, { linkCode });
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  unlinkPartner: async () => {
    set({ isLoading: true, error: null });
    try {
      await userService.unlinkPartner();
      logger.info('Partner unlinked successfully');
      // Refetch user profile and clear partner info
      await get().fetchProfile();
      set({ partnerInfo: null, isLoading: false });
    } catch (error: unknown) {
      logger.error('Failed to unlink partner', error as Error);
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  clearUser: () =>
    set({
      user: null,
      stats: null,
      partnerInfo: null,
      error: null,
      isProfileReady: false,
    }),
}));

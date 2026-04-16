import * as Notifications from 'expo-notifications';

import { create } from 'zustand';

import logger from '@/utils/logger';

type NotificationTab = 'actions' | 'permissions' | 'home';

interface NotificationState {
  unreadCounts: Record<NotificationTab, number>;

  // Actions
  incrementCount: (tab: NotificationTab) => void;
  clearCount: (tab: NotificationTab) => void;
  clearAll: () => void;
  totalUnread: () => number;
  initFromBadge: () => Promise<void>;
}

const INITIAL_COUNTS: Record<NotificationTab, number> = {
  actions: 0,
  permissions: 0,
  home: 0,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCounts: { ...INITIAL_COUNTS },

  incrementCount: (tab) => {
    set((state) => {
      const newCounts = {
        ...state.unreadCounts,
        [tab]: state.unreadCounts[tab] + 1,
      };
      const total = Object.values(newCounts).reduce((sum, c) => sum + c, 0);
      Notifications.setBadgeCountAsync(total).catch((err) => {
        logger.warn('Failed to set badge count', err as Error);
      });
      return { unreadCounts: newCounts };
    });
  },

  clearCount: (tab) => {
    set((state) => {
      const newCounts = { ...state.unreadCounts, [tab]: 0 };
      const total = Object.values(newCounts).reduce((sum, c) => sum + c, 0);
      Notifications.setBadgeCountAsync(total).catch((err) => {
        logger.warn('Failed to set badge count', err as Error);
      });
      return { unreadCounts: newCounts };
    });
  },

  clearAll: () => {
    Notifications.setBadgeCountAsync(0).catch((err) => {
      logger.warn('Failed to clear badge count', err as Error);
    });
    set({ unreadCounts: { ...INITIAL_COUNTS } });
  },

  totalUnread: () => {
    const counts = get().unreadCounts;
    return Object.values(counts).reduce((sum, c) => sum + c, 0);
  },

  initFromBadge: async () => {
    try {
      const osBadge = await Notifications.getBadgeCountAsync();
      if (osBadge > 0) {
        const current = get().unreadCounts;
        const storeTotal = Object.values(current).reduce((sum, c) => sum + c, 0);
        if (storeTotal === 0) {
          set({ unreadCounts: { ...current, home: osBadge } });
        }
      }
    } catch (err) {
      logger.warn('Failed to read OS badge count', err as Error);
    }
  },
}));

/**
 * Maps a notification type to the corresponding tab for badge tracking.
 */
export function getTabForNotificationType(type: string): NotificationTab | null {
  switch (type) {
    case 'permission_requested':
    case 'permission_response':
      return 'permissions';
    case 'action_created':
    case 'action_approved':
    case 'action_rejected':
      return 'actions';
    case 'partner_linked':
      return 'home';
    default:
      return null;
  }
}

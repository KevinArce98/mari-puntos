import * as Notifications from 'expo-notifications';

import { create } from 'zustand';

import logger from '@/utils/logger';

interface NotificationState {
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>(() => ({
  clearAll: () => {
    Notifications.setBadgeCountAsync(0).catch((err) => {
      logger.warn('Failed to clear badge count', err as Error);
    });
  },
}));

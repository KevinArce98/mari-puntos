import { useEffect, useRef } from 'react';

import { useAuth } from '@clerk/clerk-expo';
import * as Sentry from '@sentry/react-native';

import { apiService } from '@/services';
import {
  useActionsStore,
  usePermissionsStore,
  usePointsStore,
  useStreakStore,
  useUserStore,
} from '@/stores';
import { useNotificationStore } from '@/stores/notificationStore';
import logger from '@/utils/logger';

export function useClerkAuth() {
  const { getToken, isSignedIn, isLoaded, signOut, userId } = useAuth();
  const { fetchProfile, clearUser, user } = useUserStore();
  const { clearAll: clearNotifications } = useNotificationStore();
  const { clearActions } = useActionsStore();
  const { clearPermissions } = usePermissionsStore();
  const { clearPoints } = usePointsStore();
  const { clearStreak } = useStreakStore();
  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    if (isSignedIn) {
      apiService.setOnUnauthorized(() => {
        logger.warn('Auto sign-out triggered by 401 response');
        signOut().catch((err) => logger.error('Auto sign-out failed:', err as Error));
      });
    } else {
      apiService.clearOnUnauthorized();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        Sentry.setUser(userId ? { id: userId } : null);

        apiService.setTokenGetter(async () => {
          try {
            return await getToken();
          } catch (error) {
            logger.error('Error getting Clerk token:', error as Error);
            return null;
          }
        });

        if (!hasFetchedProfile.current && !user) {
          hasFetchedProfile.current = true;
          logger.info('User authenticated — loading profile');
          fetchProfile().catch((error) => {
            hasFetchedProfile.current = false; // Reset on error so we can retry
            logger.error('Error fetching user profile:', error);
          });
        }
      } else {
        logger.info('User signed out — clearing session state');
        Sentry.setUser(null);
        apiService.clearTokenGetter();
        clearUser();
        clearActions();
        clearPermissions();
        clearPoints();
        clearStreak();
        clearNotifications();
        hasFetchedProfile.current = false; // Reset when user signs out
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded, userId]);

  return {
    isSignedIn,
    isLoaded,
    signOut,
  };
}

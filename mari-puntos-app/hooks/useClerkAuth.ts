import { useEffect, useRef } from 'react';

import { useAuth } from '@clerk/clerk-expo';

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

/**
 * Hook to integrate Clerk authentication with the API service
 * This hook sets up the token getter for the API service and manages user state
 */
export function useClerkAuth() {
  const { getToken, isSignedIn, isLoaded, signOut } = useAuth();
  const { fetchProfile, clearUser, user } = useUserStore();
  const { clearAll: clearNotifications } = useNotificationStore();
  const { clearActions } = useActionsStore();
  const { clearPermissions } = usePermissionsStore();
  const { clearPoints } = usePointsStore();
  const { clearStreak } = useStreakStore();
  const hasFetchedProfile = useRef(false);

  // Wire up auto sign-out on 401 so an expired Clerk session doesn't leave the
  // user stuck in a broken state.
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
  }, [isSignedIn, isLoaded]);

  return {
    isSignedIn,
    isLoaded,
    signOut,
  };
}

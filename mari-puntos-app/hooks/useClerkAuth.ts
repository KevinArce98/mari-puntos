import { useEffect, useRef } from 'react';

import { useAuth, useUser } from '@clerk/clerk-expo';

import { apiService, userService } from '@/services';
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
  const { user: clerkUser } = useUser();
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

        // Only fetch profile if we haven't already and user doesn't exist
        if (!hasFetchedProfile.current && !user) {
          hasFetchedProfile.current = true;
          fetchProfile().catch((error) => {
            hasFetchedProfile.current = false; // Reset on error so we can retry
            if (error?.status !== 404) {
              logger.error('Error fetching user profile:', error);
            } else {
              // Profile not found — normal for new users mid-signup.
              // But if the app was killed between email verification and
              // createProfile, the Clerk session exists with no backend profile.
              // Recover by re-creating the profile from Clerk user data.
              const email = clerkUser?.primaryEmailAddress?.emailAddress;
              if (email && clerkUser?.id) {
                logger.info('Recovering orphan profile for signed-in user...');
                userService
                  .createProfile({
                    email,
                    firstName: clerkUser.firstName || '',
                    lastName: clerkUser.lastName || '',
                    clerkId: clerkUser.id,
                  })
                  .then(() => {
                    hasFetchedProfile.current = false; // Re-fetch on next render
                  })
                  .catch((createErr) => {
                    if (createErr?.status === 409) {
                      // Profile was already created — just re-fetch
                      hasFetchedProfile.current = false;
                    } else {
                      logger.info(
                        'User profile not found - normal for new users during signup'
                      );
                    }
                  });
              } else {
                logger.info(
                  'User profile not found - this is normal for new users during signup'
                );
              }
            }
          });
        }
      } else {
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
  };
}

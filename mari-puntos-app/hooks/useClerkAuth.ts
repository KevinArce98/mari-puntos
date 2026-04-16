import { useEffect, useRef } from 'react';

import { useAuth } from '@clerk/clerk-expo';

import { apiService } from '@/services';
import { useUserStore } from '@/stores';
import logger from '@/utils/logger';

/**
 * Hook to integrate Clerk authentication with the API service
 * This hook sets up the token getter for the API service and manages user state
 */
export function useClerkAuth() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { fetchProfile, clearUser, user } = useUserStore();
  const hasFetchedProfile = useRef(false);

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
          // Try to fetch profile, but don't fail if user doesn't exist yet (new user)
          fetchProfile().catch((error) => {
            hasFetchedProfile.current = false; // Reset on error so we can retry
            // Only log error if it's not a 404 (user not found)
            // New users won't have a profile until they complete signup
            if (error?.status !== 404) {
              logger.error('Error fetching user profile:', error);
            } else {
              logger.info(
                'User profile not found - this is normal for new users during signup'
              );
            }
          });
        }
      } else {
        apiService.clearTokenGetter();
        clearUser();
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

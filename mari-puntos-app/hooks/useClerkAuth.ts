import { apiService } from '@/services';
import { useUserStore } from '@/stores';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';

/**
 * Hook to integrate Clerk authentication with the API service
 * This hook sets up the token getter for the API service and manages user state
 */
export function useClerkAuth() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { fetchProfile, clearUser } = useUserStore();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        apiService.setTokenGetter(async () => {
          try {
            return await getToken();
          } catch (error) {
            console.error('Error getting Clerk token:', error);
            return null;
          }
        });

        // Try to fetch profile, but don't fail if user doesn't exist yet (new user)
        fetchProfile().catch((error) => {
          // Only log error if it's not a 404 (user not found)
          // New users won't have a profile until they complete signup
          if (error?.status !== 404) {
            console.error('Error fetching user profile:', error);
          } else {
            console.log(
              'User profile not found - this is normal for new users during signup'
            );
          }
        });
      } else {
        apiService.clearTokenGetter();
        clearUser();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded]);

  return {
    isSignedIn,
    isLoaded,
  };
}

import { Href, useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';

import { useUserStore } from '@/stores';
import logger from '@/utils/logger';

import { useClerkAuth } from './useClerkAuth';

interface UseAuthGuardOptions {
  /** Redirect to this path if user is not authenticated */
  redirectTo?: Href;
  /** If true, only check if user is signed in with Clerk */
  checkClerkOnly?: boolean;
  /** If true, also verify that user profile exists in database */
  requireProfile?: boolean;
}

/**
 * Hook to protect individual routes or components
 * Use this in specific pages that need authentication checks
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { isAuthenticated } = useAuthGuard({ requireProfile: true });
 *
 *   if (!isAuthenticated) {
 *     return <LoadingScreen />;
 *   }
 *
 *   return <YourContent />;
 * }
 * ```
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    redirectTo = '/(auth)/login' as Href,
    checkClerkOnly = false,
    requireProfile = false,
  } = options;

  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user, isLoading: isUserLoading } = useUserStore();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Determine if user is fully authenticated
  const isAuthenticated = isSignedIn && (!requireProfile || (requireProfile && !!user));
  const isLoading =
    !navigationState?.key || !isLoaded || (requireProfile && isUserLoading);

  useEffect(() => {
    if (isLoading) return;

    // Check Clerk authentication
    if (!isSignedIn) {
      router.replace(redirectTo);
      return;
    }

    // Check if profile is required and exists
    if (requireProfile && !user && !checkClerkOnly) {
      logger.warn('User is authenticated but profile not found in database');
      // You could redirect to a profile creation page here
      // router.replace('/(auth)/create-profile');
    }
  }, [isLoading, isSignedIn, user, requireProfile, checkClerkOnly, redirectTo, router]);

  return {
    /** True if user meets all authentication requirements */
    isAuthenticated,
    /** True if authentication status is being checked */
    isLoading,
    /** True if user is signed in with Clerk */
    isSignedIn,
    /** User profile from database (may be null) */
    user,
  };
}

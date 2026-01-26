import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

import { LoadingScreen } from '@/components/loading-screen';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { useUserStore } from '@/stores';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component to protect routes and ensure user is authenticated
 * Redirects to login if user is not signed in or if user profile doesn't exist
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user, isLoading: isUserLoading, clearUser } = useUserStore();
  const { signOut } = useAuth();
  const { isFirstTime, isLoading: isFirstTimeLoading } = useFirstTimeUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || isUserLoading || isFirstTimeLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // User is signed in
    if (isSignedIn) {
      // Check if user profile exists in database
      if (!user && !inAuthGroup) {
        // Profile doesn't exist, clear session and redirect to login
        console.warn('User authenticated but profile not found. Signing out...');
        clearUser();
        signOut()
          .then(() => {
            router.replace('/(auth)/login');
          })
          .catch((error) => {
            console.error('Error signing out:', error);
            router.replace('/(auth)/login');
          });
        return;
      }

      // Redirect away from auth pages if already signed in
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    } else {
      // User is not signed in
      if (!inAuthGroup) {
        // First time user: show welcome screen
        if (isFirstTime) {
          router.replace('/(auth)/welcome');
        } else {
          // Returning user: go directly to login
          router.replace('/(auth)/login');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSignedIn,
    segments,
    isLoaded,
    isUserLoading,
    isFirstTime,
    isFirstTimeLoading,
    user,
    router,
  ]);

  // Show loading screen while checking authentication and first time status
  if (!isLoaded || isUserLoading || isFirstTimeLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

import { Redirect, useSegments, useRootNavigationState } from 'expo-router';
import React from 'react';
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
  const { user, isLoading: isUserLoading } = useUserStore();
  const { isFirstTime, isLoading: isFirstTimeLoading } = useFirstTimeUser();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // Show loading screen while checking authentication, first time status, and navigation readiness
  if (!navigationState?.key || !isLoaded || isUserLoading || isFirstTimeLoading) {
    return <LoadingScreen />;
  }

  const inAuthGroup = segments[0] === '(auth)';

  // User is signed in
  if (isSignedIn) {
    // Check if user profile exists in database
    if (!user && !inAuthGroup) {
      // Profile doesn't exist - redirect to login
      return <Redirect href="/(auth)/login" />;
    }

    // Redirect away from auth pages if already signed in with valid profile
    if (inAuthGroup && user) {
      return <Redirect href="/(tabs)" />;
    }
  } else {
    // User is not signed in
    if (!inAuthGroup) {
      // First time user: show welcome screen
      if (isFirstTime) {
        return <Redirect href="/(auth)/welcome" />;
      } else {
        // Returning user: go directly to login
        return <Redirect href="/(auth)/login" />;
      }
    }
  }

  return <>{children}</>;
}

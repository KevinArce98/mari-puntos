import { useAuth } from '@clerk/clerk-expo';
import { Redirect, useSegments, useRootNavigationState } from 'expo-router';
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
  const navigationState = useRootNavigationState();

  // Handle sign out when user is authenticated but profile not found
  useEffect(() => {
    if (!isLoaded || isUserLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && !user && !inAuthGroup) {
      console.warn('User authenticated but profile not found. Signing out...');
      clearUser();
      signOut().catch((error) => {
        if (!error.message?.includes('signed out')) {
          console.error('Error signing out:', error);
        }
      });
    }
  }, [isLoaded, isSignedIn, user, isUserLoading, segments, clearUser, signOut]);

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

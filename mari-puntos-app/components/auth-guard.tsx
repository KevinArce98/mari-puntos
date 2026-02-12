import { Redirect, useSegments, useRootNavigationState } from 'expo-router';
import React from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { useUserStore } from '@/stores';
import { useSignUp } from '@clerk/clerk-expo';

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
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  // Show loading screen while checking authentication, first time status, and navigation readiness
  if (
    !navigationState?.key ||
    !isLoaded ||
    !signUpLoaded ||
    isUserLoading ||
    isFirstTimeLoading
  ) {
    return <LoadingScreen />;
  }

  const inAuthGroup = segments[0] === '(auth)';
  const inVerifyEmail = segments[1] === 'verify-email';
  const inLinkPartner = segments[0] === 'link-partner';

  // If we're in the onboarding flow (verify-email or link-partner), don't interfere - let the flow complete
  if (inVerifyEmail || inLinkPartner) {
    return <>{children}</>;
  }

  // Check if user is in the middle of email verification process
  if (signUp && signUp.status === 'missing_requirements') {
    const emailAddress = signUp.emailAddress;
    // User needs to verify their email
    if (!inVerifyEmail && emailAddress) {
      return (
        <Redirect
          href={{ pathname: '/(auth)/verify-email', params: { email: emailAddress } }}
        />
      );
    }
  }

  // User is signed in
  if (isSignedIn) {
    // Wait for user profile to load before making decisions
    if (isUserLoading) {
      return <LoadingScreen />;
    }

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

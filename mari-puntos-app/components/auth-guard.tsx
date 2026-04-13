import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { LoadingScreen } from '@/components/loading-screen';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { useUserStore } from '@/stores';
import { useSignUp } from '@clerk/clerk-expo';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component to protect routes and ensure user is authenticated.
 * Uses useEffect + router.replace instead of <Redirect> to avoid synchronous
 * navigation state updates during React Fabric layout effects, which caused
 * "Maximum update depth exceeded" errors on reload.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user, isLoading: isUserLoading, isProfileReady } = useUserStore();
  const { isFirstTime, isLoading: isFirstTimeLoading } = useFirstTimeUser();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();

  const waitingForProfile = isLoaded && isSignedIn && !isProfileReady;

  const isStillLoading =
    !navigationState?.key ||
    !isLoaded ||
    !signUpLoaded ||
    isUserLoading ||
    isFirstTimeLoading ||
    waitingForProfile;

  const inAuthGroup = segments[0] === '(auth)';
  const inVerifyEmail = segments[1] === 'verify-email';
  const inLinkPartner = segments[0] === 'link-partner';

  // Compute redirect target synchronously so we can show loading screen
  // while the useEffect fires, preventing content flash.
  let navTarget: string | null = null;
  if (!isStillLoading && !inVerifyEmail && !inLinkPartner) {
    if (signUp?.status === 'missing_requirements' && signUp.emailAddress) {
      navTarget = `/(auth)/verify-email?email=${encodeURIComponent(signUp.emailAddress)}`;
    } else if (isSignedIn) {
      if (!user && !inAuthGroup) navTarget = '/(auth)/login';
      else if (inAuthGroup && user) navTarget = '/(tabs)';
    } else if (!inAuthGroup) {
      navTarget = isFirstTime ? '/(auth)/welcome' : '/(auth)/login';
    }
  }

  // Hide the native splash screen once auth resolution is complete.
  // This keeps the splash visible during the entire loading phase so the
  // custom LoadingScreen is never visible to the user.
  const hasSplashHidden = useRef(false);
  useEffect(() => {
    if (!isStillLoading && !hasSplashHidden.current) {
      hasSplashHidden.current = true;
      SplashScreen.hideAsync();
    }
  }, [isStillLoading]);

  useEffect(() => {
    if (!navTarget) return;
    if (signUp?.status === 'missing_requirements' && signUp.emailAddress) {
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: signUp.emailAddress },
      } as any);
    } else {
      router.replace(navTarget as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navTarget]);

  if (isStillLoading || navTarget !== null) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

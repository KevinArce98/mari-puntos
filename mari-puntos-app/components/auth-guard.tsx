import React, { useEffect, useRef, useState } from 'react';

import { useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useSignUp } from '@clerk/clerk-expo';

import { LoadingScreen } from '@/components/loading-screen';
import { ProfileErrorScreen } from '@/components/profile-error-screen';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { useUserStore } from '@/stores';
import logger from '@/utils/logger';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user, isLoading: isUserLoading, isProfileReady, fetchProfile } = useUserStore();
  const { isFirstTime, isLoading: isFirstTimeLoading } = useFirstTimeUser();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const waitingForProfile = isLoaded && isSignedIn && !isProfileReady;

  const isStillLoading =
    !navigationState?.key ||
    !isLoaded ||
    !signUpLoaded ||
    isUserLoading ||
    isFirstTimeLoading ||
    waitingForProfile;

  const inAuthGroup = segments[0] === '(auth)';
  const inVerifyEmail = (segments as string[])[1] === 'verify-email';
  const inLinkPartner = segments[0] === 'link-partner';
  const profileFetchFailed =
    isLoaded && isSignedIn && isProfileReady && !user && !inAuthGroup && !inLinkPartner;

  let navTarget: string | null = null;
  if (!isStillLoading && !inVerifyEmail && !inLinkPartner && !profileFetchFailed) {
    if (signUp?.status === 'missing_requirements' && signUp.emailAddress) {
      navTarget = `/(auth)/verify-email?email=${encodeURIComponent(signUp.emailAddress)}`;
    } else if (isSignedIn) {
      if (inAuthGroup && user) navTarget = '/(tabs)';
    } else if (!inAuthGroup) {
      navTarget = isFirstTime ? '/(auth)/welcome' : '/(auth)/login';
    }
  }

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

  if (profileFetchFailed) {
    return (
      <ProfileErrorScreen
        retrying={isRetrying}
        onRetry={async () => {
          setIsRetrying(true);
          try {
            await fetchProfile();
          } catch (error) {
            logger.error('Profile retry failed', error as Error);
          } finally {
            setIsRetrying(false);
          }
        }}
        onSignOut={() => {
          signOut().catch((error) => logger.error('Sign out failed', error as Error));
        }}
      />
    );
  }

  return <>{children}</>;
}

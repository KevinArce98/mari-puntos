import React, { useEffect } from 'react';

import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Appearance } from 'react-native';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';

import { Ionicons } from '@expo/vector-icons';

import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import * as Sentry from '@sentry/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

import { AuthGuard } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';
import i18n from '@/i18n';
import { queryClient, setupQueryFocusManager } from '@/lib/queryClient';
import { useLanguageStore, useUserStore } from '@/stores';
import { borderRadius, colors, spacing, typography } from '@/theme';
import logger from '@/utils/logger';

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  const { t } = useTranslation('common');
  logger.error('Render error caught by ErrorBoundary', error);
  return (
    <View style={errorBoundaryStyles.container}>
      <Text style={errorBoundaryStyles.title}>
        {t('errorBoundary.title', { defaultValue: 'Algo salió mal' })}
      </Text>
      <Text style={errorBoundaryStyles.message}>{error.message}</Text>
      <TouchableOpacity style={errorBoundaryStyles.button} onPress={retry}>
        <Text style={errorBoundaryStyles.buttonText}>
          {t('errorBoundary.retry', { defaultValue: 'Reintentar' })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const errorBoundaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: { ...typography.styles.h2, marginBottom: spacing.sm },
  message: {
    ...typography.styles.body,
    color: colors.light.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  buttonText: { ...typography.styles.button, color: colors.light.text.white },
});

SplashScreen.preventAutoHideAsync();

setupQueryFocusManager();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  sendDefaultPii: false,

  environment: process.env.EXPO_PUBLIC_ENV,

  tracesSampleRate: __DEV__ ? 1.0 : 0.2,

  profilesSampleRate: __DEV__ ? 1.0 : 0.2,

  replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.hermesProfilingIntegration(), Sentry.mobileReplayIntegration()],

  enableAutoSessionTracking: true,

  enableNativeCrashHandling: true,

  enableLogs: true,
});

logger.info('Sentry initialized', {
  environment: process.env.EXPO_PUBLIC_ENV,
});

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
}

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? Appearance.getColorScheme();
  const themeColors = colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  useNotifications();
  const userId = useUserStore((s) => s.user?.id);
  const backendLocale = useUserStore((s) => s.user?.locale);

  useEffect(() => {
    useLanguageStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!userId) return;
    useLanguageStore.getState().reconcileWithBackend(backendLocale);
  }, [userId, backendLocale]);

  useEffect(() => {
    if (__DEV__) return;
    Updates.checkForUpdateAsync()
      .then(({ isAvailable }) => {
        if (!isAvailable) return;
        logger.info('OTA update available — fetching');
        return Updates.fetchUpdateAsync().then(() => {
          logger.info('OTA update fetched — prompting user to reload');
          Alert.alert(i18n.t('common:update.title'), i18n.t('common:update.message'), [
            { text: i18n.t('common:update.later'), style: 'cancel' },
            {
              text: i18n.t('common:update.restart'),
              onPress: () =>
                Updates.reloadAsync().catch((err) =>
                  logger.warn('OTA reload failed', err as Error)
                ),
            },
          ]);
        });
      })
      .catch((err) => {
        logger.warn('OTA update check failed', err as Error);
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="link-partner/index" options={{ headerShown: false }} />
            <Stack.Screen name="inbox/index" options={{ headerShown: false }} />
            <Stack.Screen
              name="permissions/request"
              options={{
                presentation: 'card',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="permissions/edit/[id]"
              options={{
                presentation: 'card',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="actions/review"
              options={{
                headerShown: false,
                headerBackVisible: true,
              }}
            />

            <Stack.Screen
              name="permissions/create-template"
              options={{
                presentation: 'card',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="achievements/index"
              options={{
                presentation: 'card',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="profile/change-password"
              options={{
                presentation: 'card',
                headerShown: false,
              }}
            />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Toaster
            theme={colorScheme === 'dark' ? 'dark' : 'light'}
            position="top-center"
            offset={insets.top + 10}
            richColors
            positionerStyle={{ zIndex: 9999, elevation: 9999 }}
            icons={{
              success: (
                <Ionicons name="checkmark-circle" size={20} color={themeColors.success} />
              ),
              error: <Ionicons name="close-circle" size={20} color={themeColors.error} />,
              info: (
                <Ionicons name="information-circle" size={20} color={themeColors.info} />
              ),
              warning: <Ionicons name="warning" size={20} color={themeColors.warning} />,
            }}
          />
        </AuthGuard>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </ClerkProvider>
    </I18nextProvider>
  );
});

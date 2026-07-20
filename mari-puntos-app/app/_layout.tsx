import React, { useEffect } from 'react';

import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Appearance } from 'react-native';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';

import { Ionicons } from '@expo/vector-icons';

import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import * as Sentry from '@sentry/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

import { AuthGuard } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';
import { queryClient, setupQueryFocusManager } from '@/lib/queryClient';
import { borderRadius, colors, spacing, typography } from '@/theme';
import logger from '@/utils/logger';

// Route-level error boundary — catches React render errors that Sentry.wrap cannot catch
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  logger.error('Render error caught by ErrorBoundary', error);
  return (
    <View style={errorBoundaryStyles.container}>
      <Text style={errorBoundaryStyles.title}>Algo salió mal</Text>
      <Text style={errorBoundaryStyles.message}>{error.message}</Text>
      <TouchableOpacity style={errorBoundaryStyles.button} onPress={retry}>
        <Text style={errorBoundaryStyles.buttonText}>Reintentar</Text>
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

// Keep the native splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

// Wire React Query's focus manager to RN AppState so refetchOnWindowFocus works
setupQueryFocusManager();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  // Do not send PII (IP addresses, cookies) by default.
  // Enable only if your privacy policy covers it.
  sendDefaultPii: false,

  // Set environment
  environment: process.env.EXPO_PUBLIC_ENV,

  // Enable tracing for performance monitoring
  tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod

  // Profile the JS/native threads of sampled traces (same rate as tracesSampleRate)
  profilesSampleRate: __DEV__ ? 1.0 : 0.2,

  // Session Replay: low sample rate for normal sessions, always capture on error
  replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.hermesProfilingIntegration(), Sentry.mobileReplayIntegration()],

  // Enable session tracking
  enableAutoSessionTracking: true,

  // Enable native crash tracking
  enableNativeCrashHandling: true,

  // Enable Logs
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Log Sentry initialization
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

  useEffect(() => {
    if (__DEV__) return;
    Updates.checkForUpdateAsync()
      .then(({ isAvailable }) => {
        if (!isAvailable) return;
        logger.info('OTA update available — fetching');
        return Updates.fetchUpdateAsync().then(() => {
          logger.info('OTA update fetched — prompting user to reload');
          Alert.alert(
            'Actualización disponible',
            'Hay una nueva versión de MariPuntos. ¿Deseas reiniciar la app para aplicarla?',
            [
              { text: 'Ahora no', style: 'cancel' },
              {
                text: 'Reiniciar',
                onPress: () =>
                  Updates.reloadAsync().catch((err) =>
                    logger.warn('OTA reload failed', err as Error)
                  ),
              },
            ]
          );
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
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </ClerkProvider>
  );
});

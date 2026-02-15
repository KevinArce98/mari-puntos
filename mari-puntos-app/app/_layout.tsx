import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthGuard } from '@/components';
// import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/useNotifications';
import * as Sentry from '@sentry/react-native';
import logger from '@/utils/logger';

Sentry.init({
  dsn: 'https://153f8b48a68521864815739df2df12b5@o4510342524502016.ingest.us.sentry.io/4510891051122688',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Set environment
  environment: __DEV__ ? 'development' : 'production',

  // Enable tracing for performance monitoring
  tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod

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
  environment: __DEV__ ? 'development' : 'production',
});

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

function RootLayoutNav() {
  // const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  useNotifications();

  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthGuard>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="link-partner/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="permissions/request"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="actions/index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="actions/review"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="permissions/create-template"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="rewards/index"
            options={{
              presentation: 'modal',
              title: 'Recompensas',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="achievements/index"
            options={{
              presentation: 'modal',
              title: 'Logros',
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar style="dark" />
        <Toast topOffset={Platform.OS === 'ios' ? insets.top + 10 : insets.top} />
      </AuthGuard>
    </ThemeProvider>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <RootLayoutNav />
    </ClerkProvider>
  );
});

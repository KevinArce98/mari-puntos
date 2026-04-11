import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DefaultTheme, DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthGuard } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';
import * as Sentry from '@sentry/react-native';
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  message: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  button: {
    backgroundColor: '#24C6B1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  // Do not send PII (IP addresses, cookies) by default.
  // Enable only if your privacy policy covers it.
  sendDefaultPii: false,

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

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  useNotifications();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
            name="permissions/edit/[id]"
            options={{
              presentation: 'modal',
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
          <Stack.Screen
            name="profile/change-password"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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

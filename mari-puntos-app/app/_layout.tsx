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

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <RootLayoutNav />
    </ClerkProvider>
  );
}

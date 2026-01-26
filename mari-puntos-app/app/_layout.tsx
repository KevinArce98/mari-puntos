import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { AuthGuard } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

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
            name="actions/index"
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
        <StatusBar style="auto" />
        <Toast />
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

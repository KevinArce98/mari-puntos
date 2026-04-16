import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { spacing } from '@/theme';

/**
 * Example of a route-specific auth guard component
 * This can be used to protect specific routes with custom behavior
 */
export function RouteAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const themeColors = useThemedColors();

  const handleGoToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>
          Acceso Denegado
        </Text>
        <Text style={[styles.message, { color: themeColors.text.secondary }]}>
          Necesitas iniciar sesión para acceder a esta página.
        </Text>
        <Button
          title="Ir al Login"
          onPress={handleGoToLogin}
          variant="primary"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});

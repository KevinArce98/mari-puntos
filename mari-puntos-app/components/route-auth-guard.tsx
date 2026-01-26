import { useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { colors, spacing } from '@/theme';

/**
 * Example of a route-specific auth guard component
 * This can be used to protect specific routes with custom behavior
 */
export function RouteAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Acceso Denegado</Text>
        <Text style={styles.message}>
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});

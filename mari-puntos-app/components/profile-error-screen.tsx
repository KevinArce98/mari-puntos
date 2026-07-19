import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { spacing } from '@/theme';

interface ProfileErrorScreenProps {
  onRetry: () => void;
  onSignOut: () => void;
  retrying?: boolean;
}

export function ProfileErrorScreen({
  onRetry,
  onSignOut,
  retrying,
}: ProfileErrorScreenProps) {
  const themeColors = useThemedColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>
          No pudimos cargar tu perfil
        </Text>
        <Text style={[styles.message, { color: themeColors.text.secondary }]}>
          Revisa tu conexión e intenta de nuevo. Si el problema continúa, cierra sesión y
          vuelve a iniciar sesión.
        </Text>
        <Button
          title="Reintentar"
          onPress={onRetry}
          variant="primary"
          loading={retrying}
          style={styles.button}
        />
        <Button
          title="Cerrar sesión"
          onPress={onSignOut}
          variant="ghost"
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
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 200,
    marginBottom: spacing.sm,
  },
});

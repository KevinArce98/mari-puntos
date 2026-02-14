import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { useFirstTimeUser } from '@/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markAsNotFirstTime } = useFirstTimeUser();

  // Mark as not first time when component mounts
  useEffect(() => {
    markAsNotFirstTime();
  }, [markAsNotFirstTime]);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>MariPuntos</Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationPlaceholder}>
          <Ionicons name="people" size={120} color={colors.primary} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>¡Bienvenido a MariPuntos!</Text>
        <Text style={styles.subtitle}>
          Convierte tus rutinas diarias en un juego divertido con tu pareja. ¡Gana puntos,
          desbloquea recompensas y fortalece tu vínculo!
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Comenzar"
          onPress={() => router.push('/(auth)/register')}
          fullWidth
          size="lg"
        />

        <Button
          title="¿Ya tienes una cuenta? Inicia sesión"
          onPress={() => router.push('/(auth)/login')}
          variant="ghost"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  logoImage: {
    width: 48,
    height: 48,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoText: {
    ...typography.styles.h2,
    color: colors.primary,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationPlaceholder: {
    width: 240,
    height: 240,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
});

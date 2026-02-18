import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { useFirstTimeUser, useThemedColors } from '@/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';

interface OnboardingStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: 'people',
    title: '¡Bienvenido a MariPuntos!',
    description:
      'Convierte tus rutinas diarias en un juego divertido con tu pareja. ¡Fortalece tu vínculo mientras completan tareas juntos!',
  },
  {
    icon: 'checkmark-circle',
    title: 'Completa Acciones',
    description:
      'Realiza actividades diarias y gana puntos. Desde tareas del hogar hasta detalles especiales, cada acción cuenta.',
  },
  {
    icon: 'trophy',
    title: 'Gana Recompensas',
    description:
      'Acumula puntos y canjéalos por recompensas personalizadas. ¡Tú y tu pareja deciden qué premios son más divertidos!',
  },
  {
    icon: 'stats-chart',
    title: 'Sube de Nivel',
    description:
      'Desbloquea logros, sube de nivel y compite de forma amistosa. ¡Haz que cada día sea una nueva aventura juntos!',
  },
];

export default function WelcomeScreen() {
  const themeColors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markAsNotFirstTime } = useFirstTimeUser();
  const [currentStep, setCurrentStep] = useState(0);

  // Mark as not first time when component mounts
  useEffect(() => {
    markAsNotFirstTime();
  }, [markAsNotFirstTime]);

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const currentStepData = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(ONBOARDING_STEPS.length - 1);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.logoText, { color: themeColors.primary }]}>MariPuntos</Text>
      </View>

      {/* Skip button */}
      {!isLastStep && (
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: themeColors.primary }]}>Saltar</Text>
        </Pressable>
      )}

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationPlaceholder}>
          <Ionicons name={currentStepData.icon} size={120} color={themeColors.primary} />
        </View>
      </View>

      {/* Progress Indicators */}
      <View style={styles.progressContainer}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              { backgroundColor: themeColors.gray[200] },
              index === currentStep && { backgroundColor: themeColors.primary, width: 24 },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>{currentStepData.title}</Text>
        <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>{currentStepData.description}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!isLastStep ? (
          <>
            <Button title="Siguiente" onPress={handleNext} fullWidth size="lg" />
            {currentStep > 0 && (
              <Button
                title="Anterior"
                onPress={handlePrevious}
                variant="outline"
                fullWidth
              />
            )}
          </>
        ) : (
          <>
            <Button
              title="Crear Cuenta"
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
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  skipButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    padding: spacing.sm,
    zIndex: 10,
  },
  skipText: {
    ...typography.styles.body,
    fontWeight: '600',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationPlaceholder: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.styles.body,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
});

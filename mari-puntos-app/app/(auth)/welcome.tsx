import React, { useRef, useState } from 'react';

import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { useFirstTimeUser, useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingDetail {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

interface OnboardingStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  details: OnboardingDetail[];
  numbered?: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    icon: 'people',
    title: 'Bienvenido a MariPuntos',
    description:
      'El juego de puntos para parejas: gana puntos con lo que haces por tu pareja y úsalos para pedir lo que quieres.',
    details: [
      { icon: 'add-circle-outline', text: 'Gana puntos completando acciones' },
      { icon: 'hand-right-outline', text: 'Gástalos solicitando permisos' },
      { icon: 'flame-outline', text: 'Mantengan su racha y compitan en el duelo' },
    ],
  },
  {
    icon: 'checkmark-circle',
    title: 'Gana puntos con acciones',
    description:
      'Una acción es algo que haces por tu pareja o el hogar: lavar los platos, un detalle romántico, un mandado.',
    numbered: true,
    details: [
      { icon: 'create-outline', text: 'Registra la acción que hiciste' },
      { icon: 'eye-outline', text: 'Tu pareja la revisa y la aprueba' },
      { icon: 'trending-up-outline', text: 'Los puntos se suman a tu saldo' },
    ],
  },
  {
    icon: 'hand-right',
    title: 'Usa tus puntos en permisos',
    description:
      '¿Salida con amigos? ¿Tarde de videojuegos? Pídelo como permiso y págalo con los puntos que ganaste.',
    numbered: true,
    details: [
      { icon: 'list-outline', text: 'Elige o crea el permiso que quieres' },
      { icon: 'paper-plane-outline', text: 'Envía la solicitud a tu pareja' },
      { icon: 'remove-circle-outline', text: 'Si acepta, se descuentan los puntos' },
    ],
  },
  {
    icon: 'flame',
    title: 'Crezcan juntos',
    description:
      'Para jugar, vincula tu cuenta con la de tu pareja. Te guiamos paso a paso al entrar.',
    details: [
      { icon: 'flame-outline', text: 'Racha: completen acciones cada semana' },
      { icon: 'stats-chart-outline', text: 'Duelo: compite por sumar más puntos' },
      { icon: 'trophy-outline', text: 'Logros y niveles por su progreso' },
    ],
  },
];

export default function WelcomeScreen() {
  const themeColors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markAsNotFirstTime } = useFirstTimeUser();
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingStep>>(null);

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const scrollToStep = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentStep(index);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      scrollToStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    markAsNotFirstTime();
    scrollToStep(ONBOARDING_STEPS.length - 1);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== currentStep && index >= 0 && index < ONBOARDING_STEPS.length) {
      setCurrentStep(index);
    }
  };

  const renderStep = ({ item }: { item: OnboardingStep }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>
        <View style={[styles.iconCircle, { backgroundColor: themeColors.primaryTint }]}>
          <Ionicons name={item.icon} size={72} color={themeColors.primary} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
          {item.description}
        </Text>
        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          {item.details.map((detail, index) => (
            <View key={index} style={styles.detailRow}>
              {item.numbered ? (
                <View
                  style={[styles.stepBadge, { backgroundColor: themeColors.primaryTint }]}
                >
                  <Text style={[styles.stepBadgeText, { color: themeColors.primary }]}>
                    {index + 1}
                  </Text>
                </View>
              ) : (
                <Ionicons
                  name={detail.icon}
                  size={20}
                  color={themeColors.primary}
                  style={styles.detailIcon}
                />
              )}
              <Text style={[styles.detailText, { color: themeColors.text.primary }]}>
                {detail.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
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
        <Pressable
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Saltar introducción"
        >
          <Text style={[styles.skipText, { color: themeColors.primary }]}>Saltar</Text>
        </Pressable>
      )}

      {/* Swipeable slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        renderItem={renderStep}
        keyExtractor={(_, index) => String(index)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.flatList}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Progress Indicators */}
      <View
        style={styles.progressContainer}
        accessibilityLabel={`Paso ${currentStep + 1} de ${ONBOARDING_STEPS.length}`}
      >
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              { backgroundColor: themeColors.gray[200] },
              index === currentStep && {
                backgroundColor: themeColors.primary,
                width: 24,
              },
            ]}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!isLastStep ? (
          <Button title="Siguiente" onPress={handleNext} fullWidth size="lg" />
        ) : (
          <>
            <Button
              title="Crear cuenta"
              onPress={() => {
                markAsNotFirstTime();
                router.push('/(auth)/register');
              }}
              fullWidth
              size="lg"
            />
            <Button
              title="¿Ya tienes una cuenta? Inicia sesión"
              onPress={() => {
                markAsNotFirstTime();
                router.push('/(auth)/login');
              }}
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
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  flatList: {
    flex: 1,
    marginHorizontal: -spacing.lg,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 140,
  },
  iconCircle: {
    width: 136,
    height: 136,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  detailsCard: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailIcon: {
    width: 24,
    textAlign: 'center',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    ...typography.styles.caption,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  detailText: {
    ...typography.styles.bodySm,
    flex: 1,
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
  actions: {
    gap: spacing.sm,
  },
});

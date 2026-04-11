import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { useFirstTimeUser, useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
        <View style={styles.illustrationPlaceholder}>
          <Ionicons name={item.icon} size={120} color={themeColors.primary} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
          {item.description}
        </Text>
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
        <Pressable onPress={handleSkip} style={styles.skipButton}>
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
      <View style={styles.progressContainer}>
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
              title="Crear Cuenta"
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
    fontWeight: '600',
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

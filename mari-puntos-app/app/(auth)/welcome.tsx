import React, { useMemo, useRef, useState } from 'react';

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

import { useTranslation } from 'react-i18next';
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

export default function WelcomeScreen() {
  const { t } = useTranslation('auth');
  const themeColors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markAsNotFirstTime } = useFirstTimeUser();
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingStep>>(null);

  const ONBOARDING_STEPS: OnboardingStep[] = useMemo(
    () => [
      {
        icon: 'people',
        title: t('welcome.onboarding.welcome.title'),
        description: t('welcome.onboarding.welcome.description'),
        details: [
          {
            icon: 'add-circle-outline',
            text: t('welcome.onboarding.welcome.detail1'),
          },
          {
            icon: 'hand-right-outline',
            text: t('welcome.onboarding.welcome.detail2'),
          },
          { icon: 'flame-outline', text: t('welcome.onboarding.welcome.detail3') },
        ],
      },
      {
        icon: 'checkmark-circle',
        title: t('welcome.onboarding.actions.title'),
        description: t('welcome.onboarding.actions.description'),
        numbered: true,
        details: [
          { icon: 'create-outline', text: t('welcome.onboarding.actions.detail1') },
          { icon: 'eye-outline', text: t('welcome.onboarding.actions.detail2') },
          {
            icon: 'trending-up-outline',
            text: t('welcome.onboarding.actions.detail3'),
          },
        ],
      },
      {
        icon: 'hand-right',
        title: t('welcome.onboarding.permissions.title'),
        description: t('welcome.onboarding.permissions.description'),
        numbered: true,
        details: [
          { icon: 'list-outline', text: t('welcome.onboarding.permissions.detail1') },
          {
            icon: 'paper-plane-outline',
            text: t('welcome.onboarding.permissions.detail2'),
          },
          {
            icon: 'remove-circle-outline',
            text: t('welcome.onboarding.permissions.detail3'),
          },
        ],
      },
      {
        icon: 'flame',
        title: t('welcome.onboarding.growTogether.title'),
        description: t('welcome.onboarding.growTogether.description'),
        details: [
          {
            icon: 'flame-outline',
            text: t('welcome.onboarding.growTogether.detail1'),
          },
          {
            icon: 'stats-chart-outline',
            text: t('welcome.onboarding.growTogether.detail2'),
          },
          {
            icon: 'trophy-outline',
            text: t('welcome.onboarding.growTogether.detail3'),
          },
        ],
      },
    ],
    [t]
  );

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
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.logoText, { color: themeColors.primary }]}>MariPuntos</Text>
      </View>

      {!isLastStep && (
        <Pressable
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel={t('welcome.skipA11y')}
        >
          <Text style={[styles.skipText, { color: themeColors.primary }]}>
            {t('welcome.skip')}
          </Text>
        </Pressable>
      )}

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

      <View
        style={styles.progressContainer}
        accessibilityLabel={t('welcome.progressA11y', {
          current: currentStep + 1,
          total: ONBOARDING_STEPS.length,
        })}
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

      <View style={styles.actions}>
        {!isLastStep ? (
          <Button title={t('welcome.next')} onPress={handleNext} fullWidth size="lg" />
        ) : (
          <>
            <Button
              title={t('welcome.createAccount')}
              onPress={() => {
                markAsNotFirstTime();
                router.push('/(auth)/register');
              }}
              fullWidth
              size="lg"
            />
            <Button
              title={t('welcome.haveAccount')}
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

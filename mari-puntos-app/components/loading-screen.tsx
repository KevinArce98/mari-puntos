import React, { useEffect, useState } from 'react';

import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Image } from 'expo-image';

import { useTranslation } from 'react-i18next';

import { useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';

export function LoadingScreen() {
  const { t } = useTranslation('common');
  const themeColors = useThemedColors();
  const [spinValue] = useState(() => new Animated.Value(0));
  const [pulseValue] = useState(() => new Animated.Value(1));
  const [fadeValue] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => {});
  }, []);

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (reduceMotion) return;

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinValue, pulseValue, fadeValue, reduceMotion]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeValue,
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>
        </View>

        <Text style={[styles.appName, { color: themeColors.primary }]}>MariPuntos</Text>

        <Text style={[styles.loadingText, { color: themeColors.text.secondary }]}>
          {t('actions.loading')}
        </Text>

        <View style={styles.dotsContainer}>
          <AnimatedDot delay={0} color={themeColors.primary} />
          <AnimatedDot delay={200} color={themeColors.primary} />
          <AnimatedDot delay={400} color={themeColors.primary} />
        </View>
      </Animated.View>
    </View>
  );
}

function AnimatedDot({ delay, color }: { delay: number; color: string }) {
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [delay, opacity]);

  return <Animated.View style={[styles.dot, { opacity, backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: spacing['4xl'],
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  spinnerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 60,
    borderWidth: 4,
  },
  appName: {
    ...typography.styles.h1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  loadingText: {
    ...typography.styles.body,
    marginBottom: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

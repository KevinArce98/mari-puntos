import { colors, spacing, typography } from '@/theme';
import { useThemedColors } from '@/hooks';
import React, { useEffect } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

export function LoadingScreen() {
  const themeColors = useThemedColors();
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const pulseValue = React.useRef(new Animated.Value(1)).current;
  const fadeValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
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

    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [spinValue, pulseValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: pulseValue }],
            },
          ]}
        >
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Spinning Circle */}
        <Animated.View
          style={[
            styles.spinnerContainer,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <View style={[styles.spinner, { borderColor: themeColors.gray[200], borderTopColor: themeColors.primary, borderRightColor: themeColors.primary }]} />
        </Animated.View>

        {/* App Name */}
        <Text style={[styles.appName, { color: themeColors.primary }]}>MariPuntos</Text>

        {/* Loading Text */}
        <Text style={[styles.loadingText, { color: themeColors.text.secondary }]}>Cargando...</Text>

        {/* Animated Dots */}
        <View style={styles.dotsContainer}>
          <AnimatedDot delay={0} />
          <AnimatedDot delay={200} />
          <AnimatedDot delay={400} />
        </View>
      </Animated.View>
    </View>
  );
}

function AnimatedDot({ delay }: { delay: number }) {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

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

  return <Animated.View style={[styles.dot, { opacity }]} />;
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
  logoContainer: {
    marginBottom: spacing['4xl'],
    position: 'relative',
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
    top: 150,
    width: 50,
    height: 50,
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
    fontWeight: 'bold',
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
    backgroundColor: colors.light.primary,
  },
});

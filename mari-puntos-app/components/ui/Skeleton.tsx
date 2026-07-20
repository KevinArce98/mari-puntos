import React, { useEffect } from 'react';

import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing } from '@/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  radius = borderRadius.md,
  style,
}) => {
  const colors = useThemedColors();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    if (reducedMotion) return;
    opacity.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => cancelAnimation(opacity);
  }, [reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityLabel="Cargando"
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.gray[200] },
        animatedStyle,
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 2,
  showAvatar = true,
  style,
}) => {
  const colors = useThemedColors();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      {showAvatar && <Skeleton width={48} height={48} radius={borderRadius.full} />}
      <View style={styles.cardContent}>
        <Skeleton width="60%" height={14} />
        {Array.from({ length: Math.max(lines - 1, 0) }).map((_, i) => (
          <Skeleton key={i} width={i % 2 === 0 ? '90%' : '75%'} height={12} />
        ))}
      </View>
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
  lines?: number;
  showAvatar?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 3,
  lines = 2,
  showAvatar = true,
  style,
}) => (
  <View style={style}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} lines={lines} showAvatar={showAvatar} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  cardContent: {
    flex: 1,
    gap: spacing.sm,
  },
});

import React from 'react';

import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

import { PressableScale } from './PressableScale';

interface PointsCardProps {
  points: number;
  label?: string;
  style?: ViewStyle;
  variant?: 'default' | 'compact';
  onPress?: () => void;
}

export const PointsCard: React.FC<PointsCardProps> = ({
  points,
  label = 'Total de puntos',
  style,
  variant = 'default',
  onPress,
}) => {
  const colors = useThemedColors();

  if (variant === 'compact') {
    const content = (
      <View
        style={[
          styles.compactContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
          style,
        ]}
      >
        <Ionicons name="trophy" size={20} color={colors.accent} />
        <Text style={[styles.compactPoints, { color: colors.text.primary }]}>
          {points.toLocaleString()}
        </Text>
      </View>
    );

    if (!onPress) return content;

    return (
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${points.toLocaleString()} MariPuntos. Ver logros`}
      >
        {content}
      </PressableScale>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>
        <Text style={[styles.points, { color: colors.text.primary }]}>
          {points.toLocaleString()}
        </Text>
        <View style={[styles.unitChip, { backgroundColor: colors.primaryTint }]}>
          <Text style={[styles.unit, { color: colors.primary }]}>MariPuntos</Text>
        </View>
      </View>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryTint }]}>
        <Ionicons name="trophy" size={28} color={colors.accent} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.styles.caption,
    marginBottom: spacing.xs,
  },
  points: {
    ...typography.styles.pointsMedium,
  },
  unitChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  unit: {
    ...typography.styles.caption,
  },
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  compactPoints: {
    ...typography.styles.h4,
    fontVariant: ['tabular-nums'],
  },
});

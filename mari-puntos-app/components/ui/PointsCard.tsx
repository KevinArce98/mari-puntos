// filepath: /Users/kevinarias/Projects/mari-puntos-app/components/ui/PointsCard.tsx
import { borderRadius, colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface PointsCardProps {
  points: number;
  label?: string;
  style?: ViewStyle;
  variant?: 'default' | 'compact';
}

export const PointsCard: React.FC<PointsCardProps> = ({
  points,
  label = 'Total Puntos',
  style,
  variant = 'default',
}) => {
  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <Ionicons name="trophy" size={20} color={colors.accent} />
        <Text style={styles.compactPoints}>{points.toLocaleString()}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="trophy" size={32} color={colors.accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.points}>{points.toLocaleString()}</Text>
        <Text style={styles.unit}>MariPuntos</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.styles.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  points: {
    ...typography.styles.pointsMedium,
    color: colors.white,
    lineHeight: 52,
  },
  unit: {
    ...typography.styles.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  compactPoints: {
    ...typography.styles.h4,
    color: colors.text.primary,
  },
});

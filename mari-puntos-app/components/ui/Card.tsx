import React from 'react';

import { StyleSheet, View, ViewStyle } from 'react-native';

import { useThemedColors } from '@/hooks';
import { borderRadius, shadows, spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof spacing | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const colors = useThemedColors();

  const variantStyles = {
    default: { ...shadows.sm },
    elevated: { ...shadows.md },
    outlined: { borderWidth: 1, borderColor: colors.gray[200], ...shadows.none },
    filled: { backgroundColor: colors.gray[50], ...shadows.none },
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.gray[100] },
        variantStyles[variant],
        padding !== 'none' && { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
  },
});

import React from 'react';

import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

interface BadgeProps {
  label: string | number;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'points';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const c = useThemedColors();

  const variantStyle: Record<
    BadgeProps['variant'] & string,
    { bg: string; text: string }
  > = {
    primary: { bg: c.primary, text: c.text.white },
    secondary: { bg: c.accent, text: c.text.primary },
    success: { bg: c.success, text: c.text.white },
    error: { bg: c.error, text: c.text.white },
    warning: { bg: c.warning, text: c.text.primary },
    info: { bg: c.info, text: c.text.white },
    points: { bg: c.primary, text: c.text.white },
  };

  const { bg, text } = variantStyle[variant];

  return (
    <View style={[styles.badge, styles[`size_${size}`], { backgroundColor: bg }, style]}>
      <Text style={[styles.text, styles[`text_${size}`], { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  size_sm: { paddingVertical: 2, paddingHorizontal: spacing.sm, minWidth: 20 },
  size_md: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minWidth: 24 },
  size_lg: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minWidth: 32 },
  text: { fontFamily: typography.fontFamily.bold, textAlign: 'center' },
  text_sm: { fontSize: 10 },
  text_md: { fontSize: typography.fontSize.xs },
  text_lg: { fontSize: typography.fontSize.sm },
});

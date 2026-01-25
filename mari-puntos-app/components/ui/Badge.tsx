import { borderRadius, colors, spacing, typography } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

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
  return (
    <View style={[styles.badge, styles[variant], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
        {label}
      </Text>
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
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.accent },
  success: { backgroundColor: colors.success },
  error: { backgroundColor: colors.error },
  warning: { backgroundColor: colors.warning },
  info: { backgroundColor: colors.info },
  points: { backgroundColor: colors.primary },
  size_sm: { paddingVertical: 2, paddingHorizontal: spacing.sm, minWidth: 20 },
  size_md: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minWidth: 24 },
  size_lg: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minWidth: 32 },
  text: { fontFamily: typography.fontFamily.bold, textAlign: 'center' },
  text_primary: { color: colors.white },
  text_secondary: { color: colors.text.primary },
  text_success: { color: colors.white },
  text_error: { color: colors.white },
  text_warning: { color: colors.text.primary },
  text_info: { color: colors.white },
  text_points: { color: colors.white },
  text_sm: { fontSize: 10 },
  text_md: { fontSize: typography.fontSize.xs },
  text_lg: { fontSize: typography.fontSize.sm },
});
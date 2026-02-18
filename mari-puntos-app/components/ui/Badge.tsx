import { borderRadius, colors, spacing, typography } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

const c = colors.light;

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
  primary: { backgroundColor: c.primary },
  secondary: { backgroundColor: c.accent },
  success: { backgroundColor: c.success },
  error: { backgroundColor: c.error },
  warning: { backgroundColor: c.warning },
  info: { backgroundColor: c.info },
  points: { backgroundColor: c.primary },
  size_sm: { paddingVertical: 2, paddingHorizontal: spacing.sm, minWidth: 20 },
  size_md: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minWidth: 24 },
  size_lg: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minWidth: 32 },
  text: { fontFamily: typography.fontFamily.bold, textAlign: 'center' },
  text_primary: { color: c.white },
  text_secondary: { color: c.text.primary },
  text_success: { color: c.white },
  text_error: { color: c.white },
  text_warning: { color: c.text.primary },
  text_info: { color: c.white },
  text_points: { color: c.white },
  text_sm: { fontSize: 10 },
  text_md: { fontSize: typography.fontSize.xs },
  text_lg: { fontSize: typography.fontSize.sm },
});

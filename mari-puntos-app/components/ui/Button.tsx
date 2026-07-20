import React from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

import { PressableScale } from './PressableScale';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const colors = useThemedColors();

  const variantStyles = {
    primary: { backgroundColor: colors.primary },
    // Tonal: tinte del primario, no dorado
    secondary: { backgroundColor: colors.primaryTint },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.gray[300],
    },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error },
  };

  const textVariantStyles = {
    primary: { color: colors.text.white },
    secondary: { color: colors.primary },
    outline: { color: colors.text.primary },
    ghost: { color: colors.primary },
    danger: { color: colors.text.white },
  };

  const buttonStyles = [
    styles.button,
    variantStyles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    textVariantStyles[variant],
    styles[`textSize_${size}`],
    textStyle,
  ];

  const iconColor =
    variant === 'primary' || variant === 'danger'
      ? colors.text.white
      : variant === 'outline'
        ? colors.text.primary
        : colors.primary;

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <PressableScale
      style={StyleSheet.flatten(buttonStyles)}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'danger'
              ? colors.text.white
              : colors.primary
          }
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  size_md: {
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },

  // States
  disabled: {
    opacity: 0.4,
  },
  fullWidth: {
    width: '100%',
  },

  // Text styles
  text: {
    ...typography.styles.button,
  },

  // Text sizes
  textSize_sm: {
    ...typography.styles.buttonSmall,
  },
  textSize_md: {
    ...typography.styles.button,
  },
  textSize_lg: {
    ...typography.styles.button,
    fontSize: 18,
  },
});

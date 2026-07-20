import React from 'react';

import { StyleSheet, Text, ViewStyle } from 'react-native';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

import { PressableScale } from './PressableScale';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
}) => {
  const themeColors = useThemedColors();

  return (
    <PressableScale
      style={[
        styles.chip,
        { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        selected && {
          backgroundColor: themeColors.primaryTint,
          borderColor: themeColors.primary,
        },
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          styles.label,
          { color: themeColors.text.secondary },
          selected && { color: themeColors.primary },
        ]}
      >
        {label}
      </Text>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  label: {
    ...typography.styles.bodyMedium,
  },
});

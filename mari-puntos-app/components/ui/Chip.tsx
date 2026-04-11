import { borderRadius, colors, spacing, typography } from '@/theme';
import { useThemedColors } from '@/hooks';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

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
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: themeColors.gray[100], borderColor: themeColors.gray[200] },
        selected && {
          backgroundColor: themeColors.primary,
          borderColor: themeColors.primary,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          styles.label,
          { color: themeColors.text.primary },
          selected && { color: colors.light.white },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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

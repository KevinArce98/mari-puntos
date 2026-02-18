// filepath: /Users/kevinarias/Projects/mari-puntos-app/components/ui/ActionCard.tsx
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { useThemedColors } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ActionCardProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackgroundColor?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  icon,
  iconBackgroundColor,
  onPress,
  style,
}) => {
  const colors = useThemedColors();
  const bgColor = iconBackgroundColor || colors.primary;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.gray[100] }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={24} color={colors.text.white} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.styles.h4,
  },
  subtitle: {
    ...typography.styles.caption,
    marginTop: 2,
  },
});

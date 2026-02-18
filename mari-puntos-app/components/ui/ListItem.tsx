import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius } from '@/theme';
import { useThemedColors } from '@/hooks';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  leftComponent,
  rightComponent,
  onPress,
  style,
}) => {
  const colors = useThemedColors();
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, { backgroundColor: colors.gray[100] }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {leftComponent ||
        (leftIcon && (
          <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
            <Ionicons name={leftIcon} size={24} color={colors.primary} />
          </View>
        ))}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightComponent ||
        (rightIcon && <Ionicons name={rightIcon} size={20} color={colors.gray[400]} />)}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.styles.bodyMedium,
  },
  subtitle: {
    ...typography.styles.caption,
    marginTop: spacing.xs / 2,
  },
});

import React from 'react';

import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

import { PressableScale } from './PressableScale';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  showBorder?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  leftIconColor?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  leftComponent,
  rightComponent,
  onPress,
  showBorder = false,
  style,
  titleStyle,
  leftIconColor,
}) => {
  const colors = useThemedColors();

  const content = (
    <>
      {leftComponent ||
        (leftIcon && (
          <View style={[styles.iconContainer, { backgroundColor: colors.gray[100] }]}>
            <Ionicons name={leftIcon} size={24} color={leftIconColor ?? colors.primary} />
          </View>
        ))}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }, titleStyle]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightComponent ||
        (rightIcon && <Ionicons name={rightIcon} size={20} color={colors.gray[400]} />)}
    </>
  );

  const containerStyle = [
    styles.container,
    showBorder && { borderBottomWidth: 1, borderBottomColor: colors.border },
    style,
  ];

  if (onPress) {
    return (
      <PressableScale
        style={StyleSheet.flatten(containerStyle)}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      >
        {content}
      </PressableScale>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
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

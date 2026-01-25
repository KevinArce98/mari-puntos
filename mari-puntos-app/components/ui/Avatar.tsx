import { borderRadius, colors, typography } from '@/theme';
import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface AvatarProps {
  imageUri?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  level?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUri,
  name = '',
  size = 'md',
  showLevel = false,
  level,
  style,
}) => {
  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 0) return '?';
    if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const sizeStyles = styles[`size_${size}`];
  const levelBadgeSize = size === 'xl' ? 28 : size === 'lg' ? 24 : 20;

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.container, sizeStyles]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={[styles.initials, styles[`initials_${size}`]]}>
            {getInitials(name)}
          </Text>
        )}
      </View>
      {showLevel && level !== undefined && (
        <View style={[styles.levelBadge, { width: levelBadgeSize, height: levelBadgeSize }]}>
          <Text style={styles.levelText}>Lvl {level}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.bold,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  levelText: {
    color: colors.white,
    fontSize: 8,
    fontFamily: typography.fontFamily.bold,
  },
  
  // Sizes
  size_sm: {
    width: 32,
    height: 32,
  },
  size_md: {
    width: 48,
    height: 48,
  },
  size_lg: {
    width: 56,
    height: 56,
  },
  size_xl: {
    width: 80,
    height: 80,
  },
  
  // Initials sizes
  initials_sm: {
    fontSize: typography.fontSize.xs,
  },
  initials_md: {
    fontSize: typography.fontSize.base,
  },
  initials_lg: {
    fontSize: typography.fontSize.xl,
  },
  initials_xl: {
    fontSize: typography.fontSize['2xl'],
  },
});

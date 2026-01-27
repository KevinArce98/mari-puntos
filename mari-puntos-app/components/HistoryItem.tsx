import { borderRadius, colors, spacing, typography } from '@/theme';
import { PointsLog } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HistoryItemProps {
  item: PointsLog;
  showBorder?: boolean;
  compact?: boolean;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  showBorder = false,
  compact = true,
}) => {
  // Get icon based on log type
  const getHistoryIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    if (type.includes('action') || type.includes('earned')) {
      return 'checkmark-circle-outline';
    }
    if (type.includes('permission') || type.includes('spent')) {
      return 'hand-right-outline';
    }
    if (type.includes('level')) {
      return 'trending-up-outline';
    }
    if (type.includes('achievement')) {
      return 'trophy-outline';
    }
    if (type.includes('partner')) {
      return 'people-outline';
    }
    if (type.includes('reward')) {
      return 'gift-outline';
    }
    return 'ellipse-outline';
  };

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? 'Ahora mismo' : `Hace ${diffInMinutes} min`;
    }
    if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }
    if (diffInDays < 7) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const iconSize = compact ? 20 : 24;
  const iconContainerSize = compact ? 40 : 48;

  return (
    <View style={[styles.container, showBorder && styles.borderBottom]}>
      <View
        style={[
          styles.iconContainer,
          {
            width: iconContainerSize,
            height: iconContainerSize,
            backgroundColor: item.type.includes('rejected')
              ? `${colors.error}15`
              : item.pointsChange >= 0
                ? `${colors.primary}15`
                : `${colors.accent}15`,
          },
        ]}
      >
        <Ionicons
          name={getHistoryIcon(item.type)}
          size={iconSize}
          color={
            item.type.includes('rejected')
              ? colors.error
              : item.pointsChange >= 0
                ? colors.primary
                : colors.accent
          }
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.message}</Text>
        <Text style={styles.time}>{getTimeAgo(item.createdAt)}</Text>
      </View>
      {item.pointsChange !== 0 ? (
        <View style={styles.pointsContainer}>
          <Text
            style={[
              styles.pointsLarge,
              {
                color: item.pointsChange >= 0 ? colors.primary : colors.error,
              },
            ]}
          >
            {item.pointsChange >= 0 ? '+' : ''}
            {item.pointsChange}
          </Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  iconContainer: {
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
  },
  time: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  date: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  points: {
    ...typography.styles.bodyMedium,
    fontFamily: typography.fontFamily.semiBold,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsLarge: {
    ...typography.styles.h3,
    fontFamily: typography.fontFamily.bold,
  },
  pointsLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

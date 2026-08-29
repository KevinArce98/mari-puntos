import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';
import { PointsLog } from '@/types';
import { formatRelativeTime } from '@/utils/dateUtils';

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
  const { t } = useTranslation('common');
  const colors = useThemedColors();
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

  const iconSize = compact ? 20 : 24;
  const iconContainerSize = compact ? 40 : 48;

  return (
    <View
      style={[
        styles.container,
        showBorder && { borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
      ]}
    >
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
        <Text style={[styles.title, { color: colors.text.primary }]}>{item.message}</Text>
        <Text style={[styles.time, { color: colors.text.secondary }]}>
          {formatRelativeTime(item.createdAt)}
        </Text>
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
          <Text style={[styles.pointsLabel, { color: colors.text.secondary }]}>
            {t('units.points')}
          </Text>
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
  },
  time: {
    ...typography.styles.caption,
    marginTop: 2,
  },
  date: {
    ...typography.styles.caption,
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
    marginTop: 2,
  },
});

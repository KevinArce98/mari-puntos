import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Action, ActionCategory, ActionStatus } from '@/types';
import { spacing, typography, borderRadius } from '@/theme';
import { useThemedColors } from '@/hooks';
import { formatDateWithTime } from '@/utils/dateUtils';
import { Card } from './Card';

const CATEGORY_ICON: Record<
  ActionCategory,
  {
    icon: keyof typeof Ionicons.glyphMap;
    categoryKey?: 'childcare' | 'errands' | 'romantic' | 'personalGrowth';
  }
> = {
  [ActionCategory.HOUSEHOLD]: { icon: 'home' },
  [ActionCategory.CHILDCARE]: { icon: 'people', categoryKey: 'childcare' },
  [ActionCategory.ERRANDS]: { icon: 'cart', categoryKey: 'errands' },
  [ActionCategory.ROMANTIC]: { icon: 'heart', categoryKey: 'romantic' },
  [ActionCategory.PERSONAL_GROWTH]: {
    icon: 'trending-up',
    categoryKey: 'personalGrowth',
  },
  [ActionCategory.OTHER]: { icon: 'ellipsis-horizontal' },
};

interface ActionItemCardProps {
  action: Action;
  onPress?: () => void;
  showStatus?: boolean;
}

export function ActionItemCard({
  action,
  onPress,
  showStatus = true,
}: ActionItemCardProps) {
  const themeColors = useThemedColors();

  const categoryEntry = CATEGORY_ICON[action.category];
  const categoryColor = categoryEntry.categoryKey
    ? themeColors.actionCategory[categoryEntry.categoryKey]
    : action.category === ActionCategory.OTHER
      ? themeColors.gray[500]
      : themeColors.primary;
  const CATEGORY_CONFIG = { icon: categoryEntry.icon, color: categoryColor };

  const STATUS_CONFIG: Record<
    ActionStatus,
    { label: string; color: string; bgColor: string }
  > = {
    [ActionStatus.PENDING]: {
      label: 'Pendiente',
      color: themeColors.warning,
      bgColor: `${themeColors.warning}15`,
    },
    [ActionStatus.APPROVED]: {
      label: 'Aprobada',
      color: themeColors.success,
      bgColor: `${themeColors.success}15`,
    },
    [ActionStatus.REJECTED]: {
      label: 'Rechazada',
      color: themeColors.error,
      bgColor: `${themeColors.error}15`,
    },
  };

  const statusConfig = STATUS_CONFIG[action.status];

  const formattedDate = formatDateWithTime(action.createdAt);

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        style={styles.touchable}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={`${action.title}, ${statusConfig.label}`}
      >
        <View style={styles.row}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${CATEGORY_CONFIG.color}15` },
            ]}
          >
            <Ionicons
              name={CATEGORY_CONFIG.icon}
              size={24}
              color={CATEGORY_CONFIG.color}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <Text
                style={[styles.title, { color: themeColors.text.primary }]}
                numberOfLines={1}
              >
                {action.title}
              </Text>
              {showStatus && (
                <View
                  style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}
                >
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              )}
            </View>

            {action.description && (
              <Text
                style={[styles.description, { color: themeColors.text.secondary }]}
                numberOfLines={2}
              >
                {action.description}
              </Text>
            )}

            <View style={styles.footer}>
              <Text style={[styles.date, { color: themeColors.gray[400] }]}>
                {formattedDate}
              </Text>
              {action.status === ActionStatus.APPROVED && (
                <View style={styles.pointsBadge}>
                  <Ionicons name="trophy" size={14} color={themeColors.accent} />
                  <Text style={[styles.pointsText, { color: themeColors.accent }]}>
                    +{action.pointsAwarded} pts
                  </Text>
                </View>
              )}
              {action.status === ActionStatus.REJECTED && action.rejectionReason && (
                <Text
                  style={[styles.rejectionReason, { color: themeColors.error }]}
                  numberOfLines={1}
                >
                  {action.rejectionReason}
                </Text>
              )}
            </View>
          </View>

          {/* Arrow */}
          {onPress && (
            <Ionicons name="chevron-forward" size={20} color={themeColors.gray[400]} />
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  touchable: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.styles.bodyMedium,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  statusText: {
    ...typography.styles.caption,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  description: {
    ...typography.styles.caption,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  date: {
    ...typography.styles.caption,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    ...typography.styles.caption,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  rejectionReason: {
    ...typography.styles.caption,
    flex: 1,
  },
});

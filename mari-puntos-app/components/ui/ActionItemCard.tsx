import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Action, ActionCategory, ActionStatus } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { useThemedColors } from '@/hooks';
import { formatDateWithTime } from '@/utils/dateUtils';
import { Card } from './Card';

interface ActionItemCardProps {
  action: Action;
  onPress?: () => void;
  showStatus?: boolean;
}

const CATEGORY_CONFIG: Record<
  ActionCategory,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  [ActionCategory.HOUSEHOLD]: { icon: 'home', color: colors.light.primary },
  [ActionCategory.CHILDCARE]: { icon: 'people', color: '#FF6B9D' },
  [ActionCategory.ERRANDS]: { icon: 'cart', color: '#FFA94D' },
  [ActionCategory.ROMANTIC]: { icon: 'heart', color: '#FF4757' },
  [ActionCategory.PERSONAL_GROWTH]: { icon: 'trending-up', color: '#6C5CE7' },
  [ActionCategory.OTHER]: { icon: 'ellipsis-horizontal', color: colors.light.gray[500] },
};

const STATUS_CONFIG: Record<
  ActionStatus,
  { label: string; color: string; bgColor: string }
> = {
  [ActionStatus.PENDING]: {
    label: 'Pendiente',
    color: colors.light.warning,
    bgColor: `${colors.light.warning}15`,
  },
  [ActionStatus.APPROVED]: {
    label: 'Aprobada',
    color: colors.light.success,
    bgColor: `${colors.light.success}15`,
  },
  [ActionStatus.REJECTED]: {
    label: 'Rechazada',
    color: colors.light.error,
    bgColor: `${colors.light.error}15`,
  },
};

export function ActionItemCard({
  action,
  onPress,
  showStatus = true,
}: ActionItemCardProps) {
  const themeColors = useThemedColors();
  const categoryConfig = CATEGORY_CONFIG[action.category];
  const statusConfig = STATUS_CONFIG[action.status];

  const formattedDate = formatDateWithTime(action.createdAt);

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.touchable}>
        <View style={styles.row}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${categoryConfig.color}15` },
            ]}
          >
            <Ionicons name={categoryConfig.icon} size={24} color={categoryConfig.color} />
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
    fontWeight: '600',
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
    fontWeight: '600',
  },
  rejectionReason: {
    ...typography.styles.caption,
    flex: 1,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Action, ActionCategory, ActionStatus } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/theme';
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
  [ActionCategory.HOUSEHOLD]: { icon: 'home', color: colors.primary },
  [ActionCategory.CHILDCARE]: { icon: 'people', color: '#FF6B9D' },
  [ActionCategory.ERRANDS]: { icon: 'cart', color: '#FFA94D' },
  [ActionCategory.ROMANTIC]: { icon: 'heart', color: '#FF4757' },
  [ActionCategory.PERSONAL_GROWTH]: { icon: 'trending-up', color: '#6C5CE7' },
  [ActionCategory.OTHER]: { icon: 'ellipsis-horizontal', color: colors.gray[500] },
};

const STATUS_CONFIG: Record<
  ActionStatus,
  { label: string; color: string; bgColor: string }
> = {
  [ActionStatus.PENDING]: {
    label: 'Pendiente',
    color: colors.warning,
    bgColor: `${colors.warning}15`,
  },
  [ActionStatus.APPROVED]: {
    label: 'Aprobada',
    color: colors.success,
    bgColor: `${colors.success}15`,
  },
  [ActionStatus.REJECTED]: {
    label: 'Rechazada',
    color: colors.error,
    bgColor: `${colors.error}15`,
  },
};

export function ActionItemCard({
  action,
  onPress,
  showStatus = true,
}: ActionItemCardProps) {
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
              <Text style={styles.title} numberOfLines={1}>
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
              <Text style={styles.description} numberOfLines={2}>
                {action.description}
              </Text>
            )}

            <View style={styles.footer}>
              <Text style={styles.date}>{formattedDate}</Text>
              {action.status === ActionStatus.APPROVED && (
                <View style={styles.pointsBadge}>
                  <Ionicons name="trophy" size={14} color={colors.accent} />
                  <Text style={styles.pointsText}>+{action.pointsAwarded} pts</Text>
                </View>
              )}
              {action.status === ActionStatus.REJECTED && action.rejectionReason && (
                <Text style={styles.rejectionReason} numberOfLines={1}>
                  {action.rejectionReason}
                </Text>
              )}
            </View>
          </View>

          {/* Arrow */}
          {onPress && (
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
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
    color: colors.text.primary,
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
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  date: {
    ...typography.styles.caption,
    color: colors.gray[400],
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    ...typography.styles.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  rejectionReason: {
    ...typography.styles.caption,
    color: colors.error,
    flex: 1,
  },
});

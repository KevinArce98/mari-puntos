import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionItemCard, ReviewActionModal, Chip } from '@/components/ui';
import { useActions } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';
import { ActionStatus, Action } from '@/types';

const STATUS_FILTERS = [
  { label: 'Pendientes', value: ActionStatus.PENDING },
  { label: 'Todas', value: null },
  { label: 'Aprobadas', value: ActionStatus.APPROVED },
  { label: 'Rechazadas', value: ActionStatus.REJECTED },
];

export default function ReviewActionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { partnerActions, approveAction, rejectAction, refetchPartnerActions } =
    useActions();

  const [selectedStatus, setSelectedStatus] = useState<ActionStatus | null>(
    ActionStatus.PENDING
  );
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredActions = partnerActions.filter((action) => {
    if (!selectedStatus) return true;
    return action.status === selectedStatus;
  });

  const pendingCount = partnerActions.filter(
    (a) => a.status === ActionStatus.PENDING
  ).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchPartnerActions();
    } finally {
      setRefreshing(false);
    }
  };

  const handleActionPress = (action: Action) => {
    if (action.status === ActionStatus.PENDING) {
      setSelectedAction(action);
      setShowReviewModal(true);
    }
  };

  const handleApproveAction = async (actionId: string, points: number) => {
    try {
      await approveAction(actionId, points);
      await refetchPartnerActions();
      Toast.show({
        type: 'success',
        text1: 'Acción Aprobada',
        text2: 'Los puntos han sido otorgados',
      });

      // Close modal and clear selection
      setShowReviewModal(false);
      setSelectedAction(null);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo aprobar la acción',
      });
    }
  };

  const handleRejectAction = async (actionId: string, reason: string) => {
    try {
      await rejectAction(actionId, reason);
      await refetchPartnerActions();
      Toast.show({
        type: 'success',
        text1: 'Acción Rechazada',
        text2: 'Se ha notificado a tu pareja',
      });

      // Close modal and clear selection
      setShowReviewModal(false);
      setSelectedAction(null);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo rechazar la acción',
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisar Acciones</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color={colors.warning} />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="list-outline" size={24} color={colors.primary} />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{partnerActions.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {STATUS_FILTERS.map((filter) => (
            <Chip
              key={filter.label}
              label={filter.label}
              selected={selectedStatus === filter.value}
              onPress={() => setSelectedStatus(filter.value)}
            />
          ))}
        </ScrollView>

        {/* Actions List */}
        <View style={styles.section}>
          {filteredActions.length > 0 ? (
            filteredActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleActionPress(action)}
                disabled={action.status !== ActionStatus.PENDING}
              >
                <ActionItemCard action={action} showStatus />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name={selectedStatus ? 'filter-outline' : 'checkmark-done-outline'}
                size={48}
                color={colors.gray[300]}
              />
              <Text style={styles.emptyText}>
                {selectedStatus === ActionStatus.PENDING
                  ? 'No hay acciones pendientes'
                  : selectedStatus
                    ? 'No hay acciones con este estado'
                    : 'No hay acciones para revisar'}
              </Text>
              {selectedStatus === ActionStatus.PENDING && (
                <Text style={styles.emptySubtext}>
                  Las acciones de tu pareja aparecerán aquí
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Review Action Modal */}
      <ReviewActionModal
        visible={showReviewModal}
        action={selectedAction}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedAction(null);
        }}
        onApprove={handleApproveAction}
        onReject={handleRejectAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.styles.h3,
    flex: 1,
    textAlign: 'center',
    color: colors.text.primary,
  },
  badgeContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    ...typography.styles.caption,
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.md,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing['3xl'],
  },
  filtersContainer: {
    marginBottom: spacing.md,
    marginHorizontal: -spacing.lg,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.styles.caption,
    color: colors.gray[400],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

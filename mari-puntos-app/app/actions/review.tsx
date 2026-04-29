import React, { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { LegendList } from '@legendapp/list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ActionItemCard, Chip, ReviewActionModal } from '@/components/ui';
import { useActions, useStreak, useThemedColors } from '@/hooks';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { Action, ActionStatus } from '@/types';
import logger from '@/utils/logger';

const STATUS_FILTERS = [
  { label: 'Pendientes', value: ActionStatus.PENDING },
  { label: 'Todas', value: null },
  { label: 'Aprobadas', value: ActionStatus.APPROVED },
  { label: 'Rechazadas', value: ActionStatus.REJECTED },
];

export default function ReviewActionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemedColors();
  const {
    partnerActions,
    approveAction,
    rejectAction,
    refetchPartnerActions,
    partnerActionsPagination,
  } = useActions();
  const { refetch: refetchStreak } = useStreak();
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<ActionStatus | null>(
    ActionStatus.PENDING
  );
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredActions = useMemo(
    () =>
      partnerActions.filter(
        (action) => !selectedStatus || action.status === selectedStatus
      ),
    [partnerActions, selectedStatus]
  );

  const pendingCount = useMemo(
    () => partnerActions.filter((a) => a.status === ActionStatus.PENDING).length,
    [partnerActions]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    try {
      await refetchPartnerActions({ page: 1, limit: 20 });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !partnerActionsPagination) return;
    if (partnerActionsPagination.page >= partnerActionsPagination.totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setPage(nextPage);
    try {
      await refetchPartnerActions({ page: nextPage, limit: 20 }, true);
    } finally {
      setLoadingMore(false);
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
      await Promise.all([refetchPartnerActions(), refetchStreak().catch(() => {})]);
      logger.info('Action approved successfully', { actionId, points });
      Toast.show({
        type: 'success',
        text1: 'Acción Aprobada',
        text2: 'Los puntos han sido otorgados',
      });

      // Close modal and clear selection
      setShowReviewModal(false);
      setSelectedAction(null);
    } catch (error) {
      logger.error('Failed to approve action', error as Error, { actionId, points });
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
      logger.info('Action rejected successfully', { actionId, reason });
      Toast.show({
        type: 'success',
        text1: 'Acción Rechazada',
        text2: 'Se ha notificado a tu pareja',
      });

      // Close modal and clear selection
      setShowReviewModal(false);
      setSelectedAction(null);
    } catch (error) {
      logger.error('Failed to reject action', error as Error, { actionId, reason });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo rechazar la acción',
      });
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Revisar Acciones
        </Text>
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.gray[100] }]}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color={colors.warning} />
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {pendingCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Pendientes
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.gray[200] }]} />
        <View style={styles.statItem}>
          <Ionicons name="list-outline" size={24} color={colors.primary} />
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {partnerActionsPagination?.total ?? partnerActions.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Total
            </Text>
          </View>
        </View>
      </View>

      <LegendList
        data={filteredActions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleActionPress(item)}
            disabled={item.status !== ActionStatus.PENDING}
          >
            <ActionItemCard action={item} showStatus />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
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
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={selectedStatus ? 'filter-outline' : 'checkmark-done-outline'}
              size={48}
              color={colors.gray[300]}
            />
            <Text style={[styles.emptyText, { color: colors.text.primary }]}>
              {selectedStatus === ActionStatus.PENDING
                ? 'No hay acciones pendientes'
                : selectedStatus
                  ? 'No hay acciones con este estado'
                  : 'No hay acciones para revisar'}
            </Text>
            {selectedStatus === ActionStatus.PENDING && (
              <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>
                Las acciones de tu pareja aparecerán aquí
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        estimatedItemSize={80}
      />

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
  },
  badgeContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadge: {
    borderRadius: borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    ...typography.styles.caption,
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  statsCard: {
    flexDirection: 'row',
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
  },
  statLabel: {
    ...typography.styles.caption,
  },
  divider: {
    width: 1,
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
  itemSeparator: {
    height: spacing.sm,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.styles.body,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.styles.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

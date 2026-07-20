import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { LegendList } from '@legendapp/list/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  ActionItemCard,
  Button,
  Chip,
  CreateActionModal,
  PressableScale,
} from '@/components/ui';
import { useActions, usePoints, useThemedColors, useUser } from '@/hooks';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { ActionStatus } from '@/types';
import { CreateActionFormData } from '@/validators/action.schema';

const STATUS_FILTERS = [
  { label: 'Todas', value: null },
  { label: 'Pendientes', value: ActionStatus.PENDING },
  { label: 'Aprobadas', value: ActionStatus.APPROVED },
  { label: 'Rechazadas', value: ActionStatus.REJECTED },
];

export default function ActionsScreen() {
  const colors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { myPoints } = usePoints();
  const {
    myActions,
    partnerActions,
    createAction,
    refetchMyActions,
    myActionsPagination,
  } = useActions();
  const [page, setPage] = React.useState(1);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const [selectedStatus, setSelectedStatus] = useState<ActionStatus | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Prevents selectedStatus useEffect from firing before the first useFocusEffect
  const hasFocusedRef = useRef(false);
  // Ref so useFocusEffect always reads the latest selectedStatus without it being a dep
  const selectedStatusRef = useRef(selectedStatus);
  selectedStatusRef.current = selectedStatus;

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      hasFocusedRef.current = true;
      setPage(1);
      refetchMyActions({
        page: 1,
        limit: 20,
        status: selectedStatusRef.current ?? undefined,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  useEffect(() => {
    if (!hasFocusedRef.current) return; // skip initial mount — useFocusEffect handles it
    if (!user) return;
    setPage(1);
    refetchMyActions({ page: 1, limit: 20, status: selectedStatus ?? undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  const handleLoadMore = async () => {
    if (loadingMore || !myActionsPagination) return;
    if (myActionsPagination.page >= myActionsPagination.totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setPage(nextPage);
    try {
      await refetchMyActions(
        { page: nextPage, limit: 20, status: selectedStatus ?? undefined },
        true
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreateAction = async (data: CreateActionFormData) => {
    try {
      await createAction(data);
      toast.success('Acción creada', {
        description: 'Tu acción ha sido enviada para revisión',
      });
    } catch (error) {
      toast.error('Error', { description: 'No se pudo crear la acción' });
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchMyActions();
    } finally {
      setRefreshing(false);
    }
  };

  const pendingPartnerCount = partnerActions.filter(
    (a) => a.status === ActionStatus.PENDING
  ).length;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Mis acciones
        </Text>
        <PressableScale
          onPress={() => router.push('/actions/review')}
          style={styles.reviewButton}
          accessibilityRole="button"
          accessibilityLabel={`Revisar acciones pendientes${pendingPartnerCount > 0 ? `, ${pendingPartnerCount} pendientes` : ''}`}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
          {pendingPartnerCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={[styles.badgeText, { color: colors.white }]}>
                {pendingPartnerCount}
              </Text>
            </View>
          )}
        </PressableScale>
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.gray[100] }]}>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color={colors.accent} />
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {myPoints.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Puntos totales
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.gray[200] }]} />
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color={colors.warning} />
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {myActions.filter((a) => a.status === ActionStatus.PENDING).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Pendientes
            </Text>
          </View>
        </View>
      </View>

      <LegendList
        data={myActions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActionItemCard action={item} showStatus />}
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
              name={selectedStatus ? 'filter-outline' : 'calendar-outline'}
              size={48}
              color={colors.gray[300]}
            />
            <Text style={[styles.emptyText, { color: colors.text.primary }]}>
              {selectedStatus
                ? 'No hay acciones con este estado'
                : 'No has creado acciones aún'}
            </Text>
            {!selectedStatus && (
              <>
                <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>
                  Crea tu primera acción para empezar a ganar puntos
                </Text>
                <Button
                  title="Registrar primera acción"
                  onPress={() => setShowCreateModal(true)}
                  size="sm"
                  icon="add-circle-outline"
                  style={styles.emptyButton}
                />
              </>
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

      {/* Floating Action Button */}
      <PressableScale
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreateModal(true)}
        accessibilityRole="button"
        accessibilityLabel="Crear nueva acción"
      >
        <Ionicons name="add" size={28} color={colors.text.white} />
      </PressableScale>

      {/* Create Action Modal */}
      <CreateActionModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAction}
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
  headerTitle: {
    ...typography.styles.h2,
  },
  reviewButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    ...typography.styles.caption,
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
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
    paddingBottom: spacing['4xl'],
  },
  filtersContainer: {
    marginBottom: spacing.lg,
  },
  filtersContent: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
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
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.styles.bodyLarge,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.styles.body,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.sm,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
});

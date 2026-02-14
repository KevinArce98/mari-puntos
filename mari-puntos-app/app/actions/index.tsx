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
import { ActionItemCard, CreateActionModal, Chip } from '@/components/ui';
import { useActions, usePoints } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';
import { ActionStatus } from '@/types';
import { CreateActionFormData } from '@/validators/action.schema';

const STATUS_FILTERS = [
  { label: 'Todas', value: null },
  { label: 'Pendientes', value: ActionStatus.PENDING },
  { label: 'Aprobadas', value: ActionStatus.APPROVED },
  { label: 'Rechazadas', value: ActionStatus.REJECTED },
];

export default function ActionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { myPoints } = usePoints();
  const { myActions, partnerActions, createAction, refetchMyActions } = useActions();

  const [selectedStatus, setSelectedStatus] = useState<ActionStatus | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredActions = myActions.filter((action) => {
    if (!selectedStatus) return true;
    return action.status === selectedStatus;
  });

  const handleCreateAction = async (data: CreateActionFormData) => {
    try {
      await createAction(data);
      Toast.show({
        type: 'success',
        text1: 'Acción Creada',
        text2: 'Tu acción ha sido enviada para revisión',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo crear la acción',
      });
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Acciones</Text>
        <TouchableOpacity
          onPress={() => router.push('/actions/review')}
          style={styles.reviewButton}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
          {pendingPartnerCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingPartnerCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color={colors.accent} />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{myPoints.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Puntos Totales</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color={colors.warning} />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>
              {myActions.filter((a) => a.status === ActionStatus.PENDING).length}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
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
              <ActionItemCard key={action.id} action={action} showStatus />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name={selectedStatus ? 'filter-outline' : 'calendar-outline'}
                size={48}
                color={colors.gray[300]}
              />
              <Text style={styles.emptyText}>
                {selectedStatus
                  ? 'No hay acciones con este estado'
                  : 'No has creado acciones aún'}
              </Text>
              {!selectedStatus && (
                <Text style={styles.emptySubtext}>
                  Crea tu primera acción para empezar a ganar puntos
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

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
    color: colors.text.primary,
  },
  reviewButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.styles.caption,
    color: colors.white,
    fontSize: 10,
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
});

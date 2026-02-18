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
import { useActions, usePoints, useThemedColors } from '@/hooks';
import { borderRadius, shadows, spacing, typography } from '@/theme';
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
  const colors = useThemedColors();
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
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Mis Acciones
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/actions/review')}
          style={styles.reviewButton}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
          {pendingPartnerCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={[styles.badgeText, { color: colors.white }]}>
                {pendingPartnerCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
              Puntos Totales
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
              <Text style={[styles.emptyText, { color: colors.text.primary }]}>
                {selectedStatus
                  ? 'No hay acciones con este estado'
                  : 'No has creado acciones aún'}
              </Text>
              {!selectedStatus && (
                <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>
                  Crea tu primera acción para empezar a ganar puntos
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.text.white} />
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
    padding: spacing.sm,
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
    fontWeight: 'bold',
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

import { useState } from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { LegendList } from '@legendapp/list/react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  ActionItemCard,
  Button,
  Chip,
  CreateActionModal,
  PressableScale,
} from '@/components/ui';
import { useActions, usePoints, useThemedColors } from '@/hooks';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { ActionStatus } from '@/types';
import { CreateActionFormData } from '@/validators/action.schema';

export default function ActionsScreen() {
  const { t } = useTranslation(['actions', 'common', 'errors']);
  const colors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const STATUS_FILTERS = [
    { label: t('common:filters.all'), value: null },
    { label: t('common:filters.pending'), value: ActionStatus.PENDING },
    { label: t('common:filters.approved'), value: ActionStatus.APPROVED },
    { label: t('common:filters.rejected'), value: ActionStatus.REJECTED },
  ];
  const { myPoints } = usePoints();

  const [selectedStatus, setSelectedStatus] = useState<ActionStatus | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    myActions,
    partnerActions,
    createAction,
    loadMoreMyActions,
    isFetchingMoreMyActions,
    refetchMyActions,
  } = useActions({ myStatus: selectedStatus });

  const handleCreateAction = async (data: CreateActionFormData) => {
    try {
      await createAction(data);
      toast.success(t('created'), {
        description: t('createdMessage'),
      });
    } catch (error) {
      toast.error(t('errors:title'), { description: t('createError') });
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t('title')}
        </Text>
        <PressableScale
          onPress={() => router.push('/actions/review')}
          style={styles.reviewButton}
          accessibilityRole="button"
          accessibilityLabel={
            pendingPartnerCount > 0
              ? t('reviewA11yCount', { count: pendingPartnerCount })
              : t('reviewA11y')
          }
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

      <View style={[styles.statsCard, { backgroundColor: colors.gray[100] }]}>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color={colors.accent} />
          <View style={styles.statContent}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {myPoints.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              {t('stats.totalPoints')}
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
              {t('stats.pending')}
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
        onEndReached={loadMoreMyActions}
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
              {selectedStatus ? t('empty.filtered') : t('empty.none')}
            </Text>
            {!selectedStatus && (
              <>
                <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>
                  {t('empty.hint')}
                </Text>
                <Button
                  title={t('empty.cta')}
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
          isFetchingMoreMyActions ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        estimatedItemSize={80}
      />

      <PressableScale
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreateModal(true)}
        accessibilityRole="button"
        accessibilityLabel={t('fabA11y')}
      >
        <Ionicons name="add" size={28} color={colors.text.white} />
      </PressableScale>

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

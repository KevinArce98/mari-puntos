import React, { useCallback, useMemo, useState } from 'react';

import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { PermissionCard } from '@/components';
import { Badge, Button, Card, Chip, PressableScale, SkeletonList } from '@/components/ui';
import { usePermissions, useThemedColors, useUser } from '@/hooks';
import { useColorScheme } from '@/hooks/useColorScheme';
import { borderRadius, spacing, typography } from '@/theme';
import { Permission, PermissionStatus } from '@/types';
import { formatDateOnly, getStatusColor, getStatusText } from '@/utils';
import { getApiErrorMessage } from '@/utils/errorMessage';
import { ResponseMessageFormData } from '@/validators/action.schema';

type PermissionScope = 'received' | 'sent';
type StatusFilter =
  | 'all'
  | PermissionStatus.PENDING
  | PermissionStatus.APPROVED
  | PermissionStatus.REJECTED;

export default function PermissionsScreen() {
  const { t } = useTranslation(['permissions', 'common', 'errors']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('common:filters.all') },
    { value: PermissionStatus.PENDING, label: t('common:filters.pending') },
    { value: PermissionStatus.APPROVED, label: t('common:filters.approved') },
    { value: PermissionStatus.REJECTED, label: t('common:filters.rejected') },
  ];
  const colorScheme = useColorScheme();
  const { user } = useUser();
  const { myPermissions, partnerPermissions, respondToPermission, refetch, isLoading } =
    usePermissions();
  const [scope, setScope] = useState<PermissionScope>('received');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  const receivedPending = partnerPermissions.filter(
    (permission) => permission.status === PermissionStatus.PENDING
  ).length;
  const sentPending = myPermissions.filter(
    (permission) => permission.status === PermissionStatus.PENDING
  ).length;

  const visiblePermissions = useMemo(() => {
    const source = scope === 'received' ? partnerPermissions : myPermissions;
    const filtered =
      statusFilter === 'all'
        ? source
        : source.filter((permission) => permission.status === statusFilter);

    return [...filtered].sort((first, second) => {
      const firstPending = first.status === PermissionStatus.PENDING ? 1 : 0;
      const secondPending = second.status === PermissionStatus.PENDING ? 1 : 0;
      if (firstPending !== secondPending) return secondPending - firstPending;
      return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    });
  }, [myPermissions, partnerPermissions, scope, statusFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRespond = async (
    permissionId: string,
    approved: boolean,
    data: ResponseMessageFormData
  ) => {
    setLoading(permissionId);
    try {
      await respondToPermission(permissionId, {
        approved,
        responseMessage: data.message || '',
        pointsCost: data.pointsCost,
      });
      toast.success(approved ? t('respond.approved') : t('respond.rejected'));
    } catch (error) {
      toast.error(t('errors:title'), {
        description: getApiErrorMessage(error) ?? t('respond.error'),
      });
      throw error;
    } finally {
      setLoading(null);
    }
  };

  if (isLoading && myPermissions.length === 0 && partnerPermissions.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: themeColors.background },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text.primary }]}>
            {t('title')}
          </Text>
        </View>
        <SkeletonList count={4} lines={2} style={{ padding: spacing.lg }} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: themeColors.background },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>
          {t('title')}
        </Text>
        <Button
          title={t('new')}
          icon="add"
          size="sm"
          onPress={() => router.push('/permissions/request')}
        />
      </View>

      <View
        style={[styles.scopeControl, { backgroundColor: themeColors.gray[100] }]}
        accessibilityRole="tablist"
      >
        <ScopeButton
          label={t('scope.received')}
          count={receivedPending}
          selected={scope === 'received'}
          onPress={() => setScope('received')}
        />
        <ScopeButton
          label={t('scope.sent')}
          count={sentPending}
          selected={scope === 'sent'}
          onPress={() => setScope('sent')}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersScroll}
      >
        {statusFilters.map((filter) => (
          <Chip
            key={filter.value}
            label={filter.label}
            selected={statusFilter === filter.value}
            onPress={() => setStatusFilter(filter.value)}
          />
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {visiblePermissions.length === 0 ? (
          <EmptyState
            scope={scope}
            filtered={statusFilter !== 'all'}
            onCreate={() => router.push('/permissions/request')}
          />
        ) : scope === 'received' ? (
          visiblePermissions.map((permission) => (
            <PermissionCard
              key={permission.id}
              permission={permission}
              handleRespond={handleRespond}
              loading={loading}
            />
          ))
        ) : (
          visiblePermissions.map((permission) => (
            <SentPermissionCard
              key={permission.id}
              permission={permission}
              onEdit={() => router.push(`/permissions/edit/${permission.id}`)}
              colorScheme={colorScheme}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ScopeButton({
  label,
  count,
  selected,
  onPress,
}: {
  label: string;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation('permissions');
  const colors = useThemedColors();

  return (
    <PressableScale
      style={[
        styles.scopeButton,
        selected && { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={count > 0 ? t('scope.pendingA11y', { label, count }) : label}
    >
      <Text
        style={[
          styles.scopeLabel,
          { color: selected ? colors.text.primary : colors.text.secondary },
        ]}
      >
        {label}
      </Text>
      {count > 0 && (
        <Badge
          label={count}
          variant="error"
          size="sm"
          style={{ marginTop: spacing.xs }}
        />
      )}
    </PressableScale>
  );
}

function SentPermissionCard({
  permission,
  onEdit,
  colorScheme,
}: {
  permission: Permission;
  onEdit: () => void;
  colorScheme: ReturnType<typeof useColorScheme>;
}) {
  const { t } = useTranslation('permissions');
  const colors = useThemedColors();

  return (
    <Card style={styles.permissionCard}>
      <View style={styles.permissionHeader}>
        <Text style={[styles.permissionName, { color: colors.text.primary }]}>
          {permission.template?.title || t('card.untitled')}
        </Text>
        <Badge
          label={getStatusText(permission.status)}
          variant="primary"
          size="sm"
          style={{ backgroundColor: getStatusColor(permission.status, colorScheme) }}
        />
      </View>

      {permission.template?.description && (
        <Text
          style={[
            styles.permissionMessage,
            { color: colors.text.primary, borderLeftColor: colors.primary },
          ]}
        >
          {permission.template.description}
        </Text>
      )}

      <View style={styles.permissionFooter}>
        <View>
          <Text style={[styles.permissionDate, { color: colors.text.light }]}>
            {t('card.requested', { date: formatDateOnly(permission.requestedDate) })}
          </Text>
          <Text style={[styles.permissionDate, { color: colors.text.light }]}>
            {t('card.duration', { hours: permission.durationHours })}
          </Text>
        </View>
        {(permission.pointsCost ?? 0) > 0 && (
          <Text style={[styles.permissionPoints, { color: colors.primary }]}>
            {permission.pointsCost} pts
          </Text>
        )}
      </View>

      {permission.responseMessage && (
        <View style={[styles.responseContainer, { backgroundColor: colors.gray[50] }]}>
          <Text style={[styles.responseLabel, { color: colors.text.secondary }]}>
            {t('card.response')}
          </Text>
          <Text style={[styles.responseMessage, { color: colors.text.primary }]}>
            {permission.responseMessage}
          </Text>
        </View>
      )}

      {permission.status === PermissionStatus.PENDING && (
        <Button
          title={t('card.edit')}
          onPress={onEdit}
          variant="outline"
          size="sm"
          style={styles.editButton}
          icon="create-outline"
        />
      )}
    </Card>
  );
}

function EmptyState({
  scope,
  filtered,
  onCreate,
}: {
  scope: PermissionScope;
  filtered: boolean;
  onCreate: () => void;
}) {
  const { t } = useTranslation('permissions');
  const colors = useThemedColors();
  const sent = scope === 'sent';

  return (
    <Card style={styles.emptyCard}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primaryTint }]}>
        <Ionicons
          name={
            filtered ? 'filter-outline' : sent ? 'paper-plane-outline' : 'checkmark-done'
          }
          size={32}
          color={colors.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        {filtered
          ? t('empty.noResults')
          : sent
            ? t('empty.sentTitle')
            : t('empty.receivedTitle')}
      </Text>
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
        {filtered
          ? t('empty.noResultsHint')
          : sent
            ? t('empty.sentHint')
            : t('empty.receivedHint')}
      </Text>
      {sent && !filtered && (
        <Button
          title={t('empty.newRequest')}
          onPress={onCreate}
          variant="outline"
          size="sm"
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.styles.h2,
  },
  scopeControl: {
    marginHorizontal: spacing.lg,
    padding: 4,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    gap: 4,
  },
  scopeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  scopeLabel: {
    ...typography.styles.bodyMedium,
  },
  filtersScroll: {
    flexGrow: 0,
    marginTop: spacing.md,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.md,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  permissionCard: {
    marginBottom: spacing.md,
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  permissionName: {
    ...typography.styles.h4,
    flex: 1,
  },
  permissionPoints: {
    ...typography.styles.bodyMedium,
  },
  permissionMessage: {
    ...typography.styles.body,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
  },
  permissionDate: {
    ...typography.styles.small,
    marginBottom: 2,
  },
  permissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  responseContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  responseLabel: {
    ...typography.styles.caption,
    marginBottom: spacing.xs,
  },
  responseMessage: {
    ...typography.styles.body,
  },
  editButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.styles.h4,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.styles.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

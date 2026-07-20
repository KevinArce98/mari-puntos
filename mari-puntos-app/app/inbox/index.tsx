import React, { useMemo, useState } from 'react';

import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { PermissionCard } from '@/components';
import {
  ActionItemCard,
  Badge,
  Card,
  PressableScale,
  ReviewActionModal,
} from '@/components/ui';
import { useActions, usePermissions, useStreak, useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { Action, ActionStatus, PermissionStatus } from '@/types';
import logger from '@/utils/logger';
import { ResponseMessageFormData } from '@/validators/action.schema';

export default function InboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemedColors();
  const { partnerActions, approveAction, rejectAction, refetchPartnerActions } =
    useActions();
  const {
    partnerPermissions,
    respondToPermission,
    refetch: refetchPermissions,
  } = usePermissions();
  const { refetch: refetchStreak } = useStreak();
  const [refreshing, setRefreshing] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const pendingActions = useMemo(
    () => partnerActions.filter((action) => action.status === ActionStatus.PENDING),
    [partnerActions]
  );
  const pendingPermissions = useMemo(
    () =>
      partnerPermissions.filter(
        (permission) => permission.status === PermissionStatus.PENDING
      ),
    [partnerPermissions]
  );
  const totalPending = pendingActions.length + pendingPermissions.length;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchPartnerActions(), refetchPermissions()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRespond = async (
    permissionId: string,
    approved: boolean,
    data: ResponseMessageFormData
  ) => {
    setPermissionLoading(permissionId);
    try {
      await respondToPermission(permissionId, {
        approved,
        responseMessage: data.message || '',
        pointsCost: data.pointsCost,
      });
      toast.success(approved ? 'Solicitud aprobada' : 'Solicitud rechazada');
    } catch (error) {
      toast.error('Error', { description: 'No se pudo procesar la solicitud' });
      throw error;
    } finally {
      setPermissionLoading(null);
    }
  };

  const handleApproveAction = async (actionId: string, points: number) => {
    try {
      await approveAction(actionId, points);
      await Promise.all([refetchPartnerActions(), refetchStreak().catch(() => {})]);
      setSelectedAction(null);
      toast.success('Acción aprobada', { description: 'Los puntos fueron otorgados' });
    } catch (error) {
      logger.error('Failed to approve action from inbox', error as Error, {
        actionId,
        points,
      });
      toast.error('Error', { description: 'No se pudo aprobar la acción' });
      throw error;
    }
  };

  const handleRejectAction = async (actionId: string, reason: string) => {
    try {
      await rejectAction(actionId, reason);
      await refetchPartnerActions();
      setSelectedAction(null);
      toast.success('Acción rechazada');
    } catch (error) {
      logger.error('Failed to reject action from inbox', error as Error, { actionId });
      toast.error('Error', { description: 'No se pudo rechazar la acción' });
      throw error;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </PressableScale>
        <Text style={[styles.title, { color: colors.text.primary }]}>Pendientes</Text>
        <View style={styles.headerButton}>
          {totalPending > 0 && <Badge label={totalPending} variant="error" size="sm" />}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {totalPending === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primaryTint }]}>
              <Ionicons name="checkmark-done" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              Todo al día
            </Text>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No tienes acciones ni permisos por revisar.
            </Text>
          </Card>
        ) : (
          <>
            {pendingActions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Acciones por revisar
                  </Text>
                  <Badge label={pendingActions.length} variant="warning" size="sm" />
                </View>
                {pendingActions.map((action) => (
                  <ActionItemCard
                    key={action.id}
                    action={action}
                    onPress={() => setSelectedAction(action)}
                  />
                ))}
              </View>
            )}

            {pendingPermissions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Permisos por responder
                  </Text>
                  <Badge label={pendingPermissions.length} variant="warning" size="sm" />
                </View>
                {pendingPermissions.map((permission) => (
                  <PermissionCard
                    key={permission.id}
                    permission={permission}
                    handleRespond={handleRespond}
                    loading={permissionLoading}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <ReviewActionModal
        visible={Boolean(selectedAction)}
        action={selectedAction}
        onClose={() => setSelectedAction(null)}
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
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.styles.h3,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.styles.h4,
  },
  emptyCard: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.styles.h3,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.styles.body,
    textAlign: 'center',
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, ResponseModal } from './ui';
import { spacing, typography } from '@/theme';
import { useThemedColors } from '@/hooks';
import { Permission } from '@/types';
import { getStatusColor, getStatusText } from '@/utils/general';
import { useState } from 'react';
import { ResponseMessageFormData } from '@/validators/action.schema';
import { formatDateOnly, formatDateWithTime } from '@/utils';

interface Props {
  permission: Permission;
  handleRespond: (
    permissionId: string,
    approved: boolean,
    data: ResponseMessageFormData
  ) => Promise<void>;
  loading: string | null;
}

export function PermissionCard({ permission, handleRespond, loading }: Props) {
  const colors = useThemedColors();
  const [modalVisible, setModalVisible] = useState(false);

  const handleApprove = async (data: ResponseMessageFormData) => {
    await handleRespond(permission.id, true, data);
    setModalVisible(false);
  };

  const handleReject = async (data: ResponseMessageFormData) => {
    await handleRespond(permission.id, false, data);
    setModalVisible(false);
  };

  const requesterPoints = permission.requester?.totalPoints ?? 0;
  const displayPointsCost = permission.pointsCost ?? 0;
  const hasInsufficientPoints =
    permission.status === 'pending' &&
    displayPointsCost > 0 &&
    requesterPoints < displayPointsCost;

  return (
    <>
      <Card key={permission.id} style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Text style={[styles.permissionName, { color: colors.text.primary }]}>
            {permission.template?.title || 'Solicitud sin título'}
          </Text>
          {displayPointsCost > 0 && (
            <Text style={[styles.permissionPoints, { color: colors.primary }]}>
              {displayPointsCost} pts
            </Text>
          )}
        </View>
        <Text style={[styles.permissionDate, { color: colors.text.secondary }]}>
          Fecha solicitada: {formatDateWithTime(permission.requestedDate)}
        </Text>
        <Text style={[styles.permissionDate, { color: colors.text.secondary }]}>
          Duración: {permission.durationHours} horas
        </Text>
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
        <Text style={[styles.permissionFrom, { color: colors.text.secondary }]}>
          De: {permission.requester?.firstName} {permission.requester?.lastName}
        </Text>

        {/* Show requester's available points */}
        {permission.status === 'pending' && permission.requester && (
          <View style={[styles.pointsInfo, { backgroundColor: colors.gray[50] }]}>
            <Text style={[styles.pointsInfoValue, { color: colors.primary }]}>
              {requesterPoints} pts
            </Text>
            {hasInsufficientPoints && (
              <Text style={[styles.warningText, { color: colors.error }]}>
                ⚠️ Tu pareja no tiene suficientes puntos para esta solicitud
              </Text>
            )}
          </View>
        )}

        <Text style={[styles.permissionFrom, { color: colors.text.secondary }]}>
          Fecha creación: {formatDateOnly(permission.createdAt)}
        </Text>
        {permission.status === 'pending' ? (
          <View style={styles.permissionActions}>
            <Button
              title="Responder"
              onPress={() => setModalVisible(true)}
              size="sm"
              style={styles.actionButton}
              disabled={hasInsufficientPoints}
            />
          </View>
        ) : (
          <View style={styles.permissionActions}>
            <Badge
              label={getStatusText(permission.status)}
              variant="primary"
              size="sm"
              style={{ backgroundColor: getStatusColor(permission.status) }}
            />
          </View>
        )}
      </Card>

      <ResponseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        permissionTitle={permission.template?.title || 'Permiso'}
        loading={loading === permission.id}
      />
    </>
  );
}

const styles = StyleSheet.create({
  permissionCard: {
    marginBottom: spacing.md,
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  permissionName: {
    ...typography.styles.h4,
    flex: 1,
  },
  permissionPoints: {
    ...typography.styles.bodyMedium,
  },
  permissionFrom: {
    ...typography.styles.caption,
    marginBottom: spacing.xs,
  },
  permissionMessage: {
    ...typography.styles.body,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
  },
  permissionDate: {
    ...typography.styles.body,
    marginBottom: spacing.sm,
  },
  permissionActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  pointsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  pointsInfoLabel: {
    ...typography.styles.bodyMedium,
  },
  pointsInfoValue: {
    ...typography.styles.bodyMedium,
    fontWeight: '600',
  },
  pointsInsufficient: {},
  warningContainer: {
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.styles.caption,
    textAlign: 'center',
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, ResponseModal } from './ui';
import { colors, spacing, typography } from '@/theme';
import { Permission } from '@/types';
import {
  formatDate,
  formatDateOnly,
  getStatusColor,
  getStatusText,
} from '@/utils/general';
import { useState } from 'react';
import { ResponseMessageFormData } from '@/validators/action.schema';

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
  const hasInsufficientPoints = requesterPoints < permission.pointsCost;

  return (
    <>
      <Card key={permission.id} style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionName}>
            {permission.template?.title || 'Solicitud sin título'}
          </Text>
          <Text style={styles.permissionPoints}>{permission.pointsCost} pts</Text>
        </View>
        <Text style={styles.permissionDate}>
          Fecha solicitada: {formatDate(permission.requestedDate)}
        </Text>
        <Text style={styles.permissionDate}>
          Duración: {permission.durationHours} horas
        </Text>
        {permission.template?.description && (
          <Text style={styles.permissionMessage}>{permission.template.description}</Text>
        )}
        <Text style={styles.permissionFrom}>
          De: {permission.requester?.firstName} {permission.requester?.lastName}
        </Text>
        
        {/* Show requester's available points */}
        {permission.status === 'pending' && permission.requester && (
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsInfoLabel}>Puntos disponibles:</Text>
            <Text style={[
              styles.pointsInfoValue,
              hasInsufficientPoints && styles.pointsInsufficient
            ]}>
              {requesterPoints} pts
            </Text>
          </View>
        )}
        
        {hasInsufficientPoints && permission.status === 'pending' && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Tu pareja no tiene suficientes puntos para esta solicitud
            </Text>
          </View>
        )}
        
        <Text style={styles.permissionFrom}>
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
    color: colors.text.primary,
    flex: 1,
  },
  permissionPoints: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
  },
  permissionFrom: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  permissionMessage: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
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
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  pointsInfoLabel: {
    ...typography.styles.bodyMedium,
    color: colors.text.secondary,
  },
  pointsInfoValue: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  pointsInsufficient: {
    color: colors.error,
  },
  warningContainer: {
    backgroundColor: `${colors.error}15`,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.styles.caption,
    color: colors.error,
    textAlign: 'center',
  },
});

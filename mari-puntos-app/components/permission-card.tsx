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

interface Props {
  permission: Permission;
  handleRespond: (
    permissionId: string,
    approved: boolean,
    message: string
  ) => Promise<void>;
  loading: string | null;
}

export function PermissionCard({ permission, handleRespond, loading }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleApprove = async (message: string) => {
    await handleRespond(permission.id, true, message);
    setModalVisible(false);
  };

  const handleReject = async (message: string) => {
    await handleRespond(permission.id, false, message);
    setModalVisible(false);
  };

  console.log(permission);
  return (
    <>
      <Card key={permission.id} style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionName}>{permission.title}</Text>
          <Text style={styles.permissionPoints}>{permission.pointsCost} pts</Text>
        </View>
        <Text style={styles.permissionDate}>
          Fecha a solicitar: {formatDate(permission.requestedDate)}
        </Text>
        {permission.description && (
          <Text style={styles.permissionMessage}>{permission.description}</Text>
        )}
        <Text style={styles.permissionFrom}>
          De: {permission.requester?.firstName} {permission.requester?.lastName}
        </Text>
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
        permissionTitle={permission.title}
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
});

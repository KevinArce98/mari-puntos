import { useState } from 'react';

import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { useTranslation } from 'react-i18next';

import { useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { Permission } from '@/types';
import { formatDateOnly, formatDateWithTime } from '@/utils';
import { getStatusColor, getStatusText } from '@/utils/general';
import { ResponseMessageFormData } from '@/validators/action.schema';

import { Badge, Button, Card, ResponseModal } from './ui';

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
  const { t } = useTranslation(['permissions', 'common']);
  const colors = useThemedColors();
  const colorScheme = useColorScheme();
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

  return (
    <>
      <Card key={permission.id} style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <Text style={[styles.permissionName, { color: colors.text.primary }]}>
            {permission.template?.title || t('cardFull.untitled')}
          </Text>
          {displayPointsCost > 0 && (
            <Text style={[styles.permissionPoints, { color: colors.primary }]}>
              {displayPointsCost} {t('common:units.points')}
            </Text>
          )}
        </View>
        <Text style={[styles.permissionDate, { color: colors.text.secondary }]}>
          {t('cardFull.requestedDate', {
            date: formatDateWithTime(permission.requestedDate),
          })}
        </Text>
        <Text style={[styles.permissionDate, { color: colors.text.secondary }]}>
          {t('cardFull.duration', { hours: permission.durationHours })}
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
        <Text style={[styles.permissionDate, { color: colors.text.secondary }]}>
          {t('cardFull.createdDate', { date: formatDateOnly(permission.createdAt) })}
        </Text>
        {permission.status === 'pending' ? (
          <View style={styles.permissionActions}>
            <Button
              title={t('cardFull.respond')}
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
              style={{ backgroundColor: getStatusColor(permission.status, colorScheme) }}
            />
          </View>
        )}
      </Card>

      <ResponseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        permissionTitle={permission.template?.title || t('cardFull.fallbackTitle')}
        suggestedPointsCost={permission.template?.suggestedPointsCost}
        requesterPoints={requesterPoints}
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
});

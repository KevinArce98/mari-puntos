import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button } from '@/components/ui';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { usePermissions } from '@/hooks';
import Toast from 'react-native-toast-message';

export default function PermissionsScreen() {
  const router = useRouter();
  const { permissions, pendingApprovals, respondToPermission, refetch } = usePermissions();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRespond = async (permissionId: string, approved: boolean) => {
    setLoading(permissionId);
    try {
      await respondToPermission(permissionId, { approved });
      Toast.show({
        type: 'success',
        text1: approved ? 'Permiso aprobado' : 'Permiso rechazado',
        text2: approved ? '¡Tu pareja está feliz!' : 'Permiso denegado',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo procesar la solicitud',
      });
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Action */}
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/permissions/request')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="add-circle" size={32} color={colors.white} />
          </View>
          <View style={styles.quickActionText}>
            <Text style={styles.quickActionTitle}>Solicitar Permiso</Text>
            <Text style={styles.quickActionSubtitle}>
              Pide permiso a tu pareja
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.white} />
        </TouchableOpacity>

        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Por aprobar</Text>
              <Badge label={pendingApprovals.length.toString()} variant="error" />
            </View>
            {pendingApprovals.map((permission) => (
              <Card key={permission.id} style={styles.permissionCard}>
                <View style={styles.permissionHeader}>
                  <Text style={styles.permissionName}>{permission.actionName}</Text>
                  <Text style={styles.permissionPoints}>
                    {permission.pointsCost} pts
                  </Text>
                </View>
                <Text style={styles.permissionFrom}>
                  De: {permission.requesterName}
                </Text>
                {permission.message && (
                  <Text style={styles.permissionMessage}>
                    "{permission.message}"
                  </Text>
                )}
                <Text style={styles.permissionDate}>
                  {new Date(permission.createdAt).toLocaleString()}
                </Text>
                <View style={styles.permissionActions}>
                  <Button
                    title="Rechazar"
                    onPress={() => handleRespond(permission.id, false)}
                    variant="outline"
                    size="sm"
                    loading={loading === permission.id}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Aprobar"
                    onPress={() => handleRespond(permission.id, true)}
                    size="sm"
                    loading={loading === permission.id}
                    style={styles.actionButton}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* My Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis solicitudes</Text>
          {permissions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>
                No tienes solicitudes de permisos
              </Text>
              <Button
                title="Solicitar permiso"
                onPress={() => router.push('/permissions/request')}
                variant="outline"
                size="sm"
              />
            </Card>
          ) : (
            permissions.map((permission) => (
              <Card key={permission.id} style={styles.permissionCard}>
                <View style={styles.permissionHeader}>
                  <Text style={styles.permissionName}>{permission.actionName}</Text>
                  <Badge
                    label={getStatusText(permission.status)}
                    variant="primary"
                    size="sm"
                    style={{ backgroundColor: getStatusColor(permission.status) }}
                  />
                </View>
                <Text style={styles.permissionFrom}>
                  Para: {permission.requesterName === 'Tú' ? permission.requesterName : permission.approverId}
                </Text>
                {permission.message && (
                  <Text style={styles.permissionMessage}>
                    "{permission.message}"
                  </Text>
                )}
                <View style={styles.permissionFooter}>
                  <Text style={styles.permissionDate}>
                    {new Date(permission.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.permissionPoints}>
                    {permission.pointsCost} pts
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickActionIcon: {
    marginRight: spacing.md,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    ...typography.styles.h4,
    color: colors.white,
    marginBottom: spacing.xs / 2,
  },
  quickActionSubtitle: {
    ...typography.styles.caption,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
  },
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
    ...typography.styles.small,
    color: colors.text.light,
  },
  permissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  permissionActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PermissionCard } from '@/components';
import { getStatusColor, getStatusText } from '@/utils/general';

export default function PermissionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    myPermissions,
    partnerPermissions,
    pendingPermissions,
    pendingCount,
    respondToPermission,
    refetch,
  } = usePermissions();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  console.log(partnerPermissions);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRespond = async (
    permissionId: string,
    approved: boolean,
    responseMessage: string
  ) => {
    setLoading(permissionId);
    try {
      await respondToPermission(permissionId, { approved, responseMessage });
      Toast.show({
        type: 'success',
        text1: approved ? 'Permiso aprobado' : 'Permiso rechazado',
        text2: approved ? '¡Tu pareja está feliz!' : '',
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (error as any)?.error
          ? (error as any).error
          : 'No se pudo procesar la solicitud',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Action */}
        {myPermissions.length > 0 && (
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/permissions/request')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-circle" size={32} color={colors.white} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Solicitar Permiso</Text>
              <Text style={styles.quickActionSubtitle}>Pide permiso a tu pareja</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.white} />
          </TouchableOpacity>
        )}

        {/* Pending Approvals */}
        {pendingCount > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Por aprobar</Text>
              <Badge label={pendingCount} variant="error" />
            </View>
            {pendingPermissions.map((permission) => (
              <PermissionCard
                key={permission.id}
                permission={permission}
                handleRespond={handleRespond}
                loading={loading}
              />
            ))}
          </View>
        )}

        {/* Approved or Rejected Permissions */}
        {partnerPermissions.filter((p) => p.status !== 'pending').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Respuestas a Permisos</Text>
              <Badge
                label={partnerPermissions
                  .filter((p) => p.status !== 'pending')
                  .length.toString()}
                variant="info"
              />
            </View>
            {partnerPermissions
              .filter((p) => p.status !== 'pending')
              .map((permission) => (
                <PermissionCard
                  key={permission.id}
                  permission={permission}
                  handleRespond={handleRespond}
                  loading={loading}
                />
              ))}
          </View>
        )}

        {/* My Permissions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis solicitudes</Text>
          </View>
          {myPermissions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>No tienes solicitudes de permisos</Text>
              <Button
                title="Solicitar permiso"
                onPress={() => router.push('/permissions/request')}
                variant="outline"
                size="sm"
              />
            </Card>
          ) : (
            myPermissions.map((permission) => (
              <Card key={permission.id} style={styles.permissionCard}>
                <View style={styles.permissionHeader}>
                  <Text style={styles.permissionName}>{permission.title}</Text>
                  <Badge
                    label={getStatusText(permission.status)}
                    variant="primary"
                    size="sm"
                    style={{ backgroundColor: getStatusColor(permission.status) }}
                  />
                </View>
                {/* <Text style={styles.permissionFrom}>
                  Para:{' '}
                  {permission.requesterName === 'Tú'
                    ? permission.requesterName
                    : permission.approverId}
                </Text> */}
                {permission.description && (
                  <Text style={styles.permissionMessage}>{permission.description}</Text>
                )}
                <View style={styles.permissionFooter}>
                  <Text style={styles.permissionDate}>
                    {new Date(permission.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.permissionPoints}>{permission.pointsCost} pts</Text>
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

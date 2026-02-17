import { ActionCard, Avatar, Card, PointsCard, CreateActionModal } from '@/components/ui';
import { HistoryItem } from '@/components';
import { usePoints, useUser } from '@/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import logger from '@/utils/logger';
import Toast from 'react-native-toast-message';
import { useActions } from '@/hooks/useActions';
import { CreateActionFormData } from '@/validators/action.schema';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, hasPartner, refetch: refetchUser } = useUser();
  const { myPoints, pointsHistory, fetchHistory } = usePoints();
  const { createAction } = useActions();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showCreateActionModal, setShowCreateActionModal] = React.useState(false);

  // Load history on mount
  React.useEffect(() => {
    if (hasPartner) {
      fetchHistory({ limit: 3 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPartner]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload user data (including points) and history in parallel
      await Promise.all([
        refetchUser(),
        hasPartner ? fetchHistory({ limit: 3 }) : Promise.resolve(),
      ]);
      logger.debug('Home screen data refreshed successfully');
    } catch (error) {
      logger.error('Error refreshing home screen data', error as Error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateAction = async (data: CreateActionFormData) => {
    try {
      await createAction(data);
      setShowCreateActionModal(false);
      Toast.show({
        type: 'success',
        text1: 'Acción Creada',
        text2: 'Tu acción ha sido enviada para revisión',
      });
      // Refresh history to show the new action
      await fetchHistory({ limit: 3 });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo crear la acción',
      });
    }
  };

  if (!hasPartner) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Card style={styles.noPartnerCard}>
            <View style={styles.noPartnerIcon}>
              <Ionicons name="people-outline" size={64} color={colors.primary} />
            </View>
            <Text style={styles.noPartnerTitle}>¡Vincula a tu Pareja!</Text>
            <Text style={styles.noPartnerText}>
              Conéctate con tu pareja para empezar a ganar y gastar MariPuntos juntos
            </Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/link-partner')}
            >
              <Ionicons name="link" size={20} color={colors.white} />
              <Text style={styles.linkButtonText}>Vincular Ahora</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Avatar and Greeting */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              imageUri={user?.avatarUrl}
              name={user?.firstName}
              size="lg"
              showLevel
              // level={myLevel} TODO: enable level when ready
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                Hola, {user?.firstName?.split(' ')[0] || 'there'}! 👋
              </Text>
              <Text style={styles.subtitle}>Vamos a ganar algunos puntos hoy!</Text>
            </View>
          </View>
        </View>

        {/* Points Card */}
        <PointsCard points={myPoints} label="Saldo Actual" style={styles.pointsCard} />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsContainer}>
            <ActionCard
              title="Solicitar Permiso"
              subtitle="Solicitar permiso para una actividad"
              icon="hand-right-outline"
              iconBackgroundColor={colors.accent}
              onPress={() => router.push('/permissions/request')}
              style={styles.actionCard}
            />
            <ActionCard
              title="Registrar Acción"
              subtitle="Registrar una actividad para ganar puntos"
              icon="add-circle-outline"
              iconBackgroundColor={colors.primary}
              onPress={() => setShowCreateActionModal(true)}
              style={styles.actionCard}
            />
          </View>
        </View>

        {/* Recent History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial Reciente</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.seeAllText}>Ver Todo</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.historyCard} padding="none">
            {pointsHistory.length === 0 ? (
              <View style={styles.emptyHistoryContainer}>
                <Ionicons name="time-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.emptyHistoryText}>No hay actividad reciente</Text>
              </View>
            ) : (
              pointsHistory
                .slice(0, 3)
                .map((item, index) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    showBorder={index !== Math.min(pointsHistory.length, 3) - 1}
                    compact
                  />
                ))
            )}
          </Card>
        </View>
      </ScrollView>

      {/* Create Action Modal */}
      <CreateActionModal
        visible={showCreateActionModal}
        onClose={() => setShowCreateActionModal(false)}
        onSubmit={handleCreateAction}
      />
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
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    marginLeft: spacing.md,
  },
  greeting: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsCard: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
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
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  actionCard: {
    marginBottom: spacing.sm,
  },
  historyCard: {
    overflow: 'hidden',
  },
  emptyHistoryContainer: {
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryText: {
    ...typography.styles.bodyLarge,
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  // No partner state
  noPartnerCard: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    padding: spacing.xl,
  },
  noPartnerIcon: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  noPartnerTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noPartnerText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  linkButtonText: {
    ...typography.styles.button,
    color: colors.white,
  },
});

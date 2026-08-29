import React, { useCallback } from 'react';

import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { HistoryItem } from '@/components';
import {
  ActionCard,
  Avatar,
  Card,
  CreateActionModal,
  NotificationBell,
  PointsCard,
  PressableScale,
  StreakCard,
} from '@/components/ui';
import { usePermissions, usePoints, useStreak, useThemedColors, useUser } from '@/hooks';
import { useActions } from '@/hooks/useActions';
import { borderRadius, spacing, typography } from '@/theme';
import { ActionStatus } from '@/types';
import logger from '@/utils/logger';
import { CreateActionFormData } from '@/validators/action.schema';

function GuideSteps({ title, steps }: { title: string; steps: string[] }) {
  const colors = useThemedColors();
  return (
    <Card style={styles.guideCard}>
      <Text style={[styles.guideTitle, { color: colors.text.primary }]}>{title}</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.guideRow}>
          <View style={[styles.guideBadge, { backgroundColor: colors.primaryTint }]}>
            <Text style={[styles.guideBadgeText, { color: colors.primary }]}>
              {index + 1}
            </Text>
          </View>
          <Text style={[styles.guideText, { color: colors.text.secondary }]}>{step}</Text>
        </View>
      ))}
    </Card>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation(['home', 'common', 'errors']);
  const colors = useThemedColors();
  const router = useRouter();
  const { createAction: createActionParam } = useLocalSearchParams<{
    createAction?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { user, hasPartner, refetch: refetchUser } = useUser();
  const { myPoints, myLevel, pointsHistory, fetchHistory } = usePoints();
  const { streak, refetch: refetchStreak } = useStreak();
  const { createAction, partnerActions, refetchPartnerActions } = useActions();
  const { pendingCount: pendingPermissionsCount, refetch: refetchPermissions } =
    usePermissions();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showCreateActionModal, setShowCreateActionModal] = React.useState(false);
  const pendingActionsCount = partnerActions.filter(
    (action) => action.status === ActionStatus.PENDING
  ).length;
  const totalPending = pendingActionsCount + pendingPermissionsCount;

  const [prevCreateActionParam, setPrevCreateActionParam] =
    React.useState(createActionParam);
  if (createActionParam !== prevCreateActionParam) {
    setPrevCreateActionParam(createActionParam);
    if (createActionParam === '1') {
      setShowCreateActionModal(true);
    }
  }

  React.useEffect(() => {
    if (createActionParam === '1') {
      router.setParams({ createAction: '' });
    }
  }, [createActionParam, router]);

  useFocusEffect(
    useCallback(() => {
      if (!user || !hasPartner) return;
      fetchHistory({ limit: 3 });
      refetchStreak().catch(() => {});
      refetchPartnerActions().catch(() => {});
      refetchPermissions().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, hasPartner])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUser(),
        hasPartner ? fetchHistory({ limit: 3 }) : Promise.resolve(),
        hasPartner ? refetchStreak() : Promise.resolve(),
        hasPartner ? refetchPartnerActions() : Promise.resolve(),
        hasPartner ? refetchPermissions() : Promise.resolve(),
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
      toast.success(t('actionCreated'), {
        description: t('actionCreatedMessage'),
      });
      await fetchHistory({ limit: 3 });
    } catch (error) {
      toast.error(t('errors:title'), { description: t('actionCreateError') });
      throw error;
    }
  };

  if (!hasPartner) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
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
            <Text style={[styles.noPartnerTitle, { color: colors.text.primary }]}>
              {t('noPartner.title')}
            </Text>
            <Text style={[styles.noPartnerText, { color: colors.text.secondary }]}>
              {t('noPartner.text')}
            </Text>
            <PressableScale
              style={[styles.linkButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/link-partner')}
            >
              <Ionicons name="link" size={20} color={colors.text.white} />
              <Text style={[styles.linkButtonText, { color: colors.text.white }]}>
                {t('noPartner.cta')}
              </Text>
            </PressableScale>
          </Card>

          <GuideSteps
            title={t('guide.howItWorksTitle')}
            steps={[t('guide.noPartner1'), t('guide.noPartner2'), t('guide.noPartner3')]}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              imageUri={user?.avatarUrl}
              name={user?.firstName}
              size="lg"
              showLevel
              level={myLevel}
            />
            <View style={styles.greetingContainer}>
              <Text style={[styles.greeting, { color: colors.text.primary }]}>
                {user?.firstName
                  ? t('greeting', { name: user.firstName.split(' ')[0] })
                  : t('greetingFallback')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                {t('subtitle')}
              </Text>
            </View>
          </View>
          <NotificationBell />
        </View>

        {totalPending > 0 && (
          <ActionCard
            title={t('pending', { count: totalPending })}
            subtitle={t('pendingSubtitle')}
            icon="notifications"
            iconBackgroundColor={colors.warning}
            onPress={() => router.push('/inbox')}
            style={styles.pendingCard}
          />
        )}

        {pointsHistory.length === 0 && (
          <GuideSteps
            title={t('guide.firstStepsTitle')}
            steps={[t('guide.first1'), t('guide.first2'), t('guide.first3')]}
          />
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {pointsHistory.length === 0
              ? t('quickActionsFirstTitle')
              : t('quickActionsTitle')}
          </Text>
          <View style={styles.actionsContainer}>
            <ActionCard
              title={t('requestPermission')}
              subtitle={t('requestPermissionSubtitle')}
              icon="hand-right-outline"
              iconBackgroundColor={colors.accent}
              onPress={() => router.push('/permissions/request')}
              style={styles.actionCard}
            />
            <ActionCard
              title={t('logAction')}
              subtitle={t('logActionSubtitle')}
              icon="add-circle-outline"
              iconBackgroundColor={colors.primary}
              onPress={() => setShowCreateActionModal(true)}
              style={styles.actionCard}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              {t('progressTitle')}
            </Text>
            <PressableScale
              onPress={() => router.push('/achievements')}
              accessibilityRole="button"
              accessibilityLabel={t('seeAchievementsA11y')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                {t('seeAchievements')}
              </Text>
            </PressableScale>
          </View>
          <View style={styles.progressRow}>
            <PointsCard
              points={myPoints}
              label={t('balanceLabel')}
              variant="compact"
              onPress={() => router.push('/achievements')}
            />
            {streak && <StreakCard streak={streak} variant="compact" />}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              {t('recentHistoryTitle')}
            </Text>
            <PressableScale onPress={() => router.push('/history')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                {t('common:actions.seeAll')}
              </Text>
            </PressableScale>
          </View>

          <Card style={styles.historyCard} padding="none">
            {pointsHistory.length === 0 ? (
              <View style={styles.emptyHistoryContainer}>
                <Ionicons name="time-outline" size={48} color={colors.text.secondary} />
                <Text style={[styles.emptyHistoryText, { color: colors.text.primary }]}>
                  {t('noRecentActivity')}
                </Text>
                <PressableScale onPress={() => setShowCreateActionModal(true)}>
                  <Text style={[{ color: colors.primary }, styles.emptyHistoryCta]}>
                    {t('logFirstAction')}
                  </Text>
                </PressableScale>
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
  },
  subtitle: {
    ...typography.styles.caption,
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCard: {
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
    marginBottom: spacing.md,
  },
  seeAllText: {
    ...typography.styles.bodyMedium,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptyHistoryCta: {
    ...typography.styles.bodyMedium,
    marginTop: spacing.md,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noPartnerText: {
    ...typography.styles.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  linkButtonText: {
    ...typography.styles.button,
  },
  guideCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  guideTitle: {
    ...typography.styles.h4,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  guideBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBadgeText: {
    ...typography.styles.caption,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  guideText: {
    ...typography.styles.bodySm,
    flex: 1,
    paddingTop: 2,
  },
});

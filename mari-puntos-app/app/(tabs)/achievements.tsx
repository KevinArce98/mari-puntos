import React, { useMemo } from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Badge,
  Card,
  Chip,
  PressableScale,
  ProgressBar,
  SkeletonList,
} from '@/components/ui';
import { useAchievements, useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';
import { Achievement, AchievementType } from '@/types';
import { formatDateOnly } from '@/utils/dateUtils';

const FILTER_VALUES = ['all', 'unlocked', 'locked'] as const;

type FilterValue = (typeof FILTER_VALUES)[number];

export function AchievementsScreenContent({ showBack = false }: { showBack?: boolean }) {
  const { t } = useTranslation('achievements');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemedColors();

  const FILTERS = FILTER_VALUES.map((value) => ({
    value,
    label: t(`filters.${value}`),
  }));

  const ACHIEVEMENT_TYPE_LABELS: Record<AchievementType, string> = {
    [AchievementType.POINTS_MILESTONE]: t('types.points_milestone'),
    [AchievementType.LEVEL_MILESTONE]: t('types.level_milestone'),
    [AchievementType.ACTIONS_COMPLETED]: t('types.actions_completed'),
    [AchievementType.PERMISSIONS_GRANTED]: t('types.permissions_granted'),
    [AchievementType.STREAK]: t('types.streak'),
    [AchievementType.SPECIAL]: t('types.special'),
  };
  const { achievements, unlockedAchievements, lockedAchievements, isLoading, error } =
    useAchievements();
  const [selectedFilter, setSelectedFilter] = React.useState<FilterValue>('all');

  const total = achievements.length;
  const completionPct =
    total > 0 ? Math.round((unlockedAchievements.length / total) * 100) : 0;

  const { unlocked, locked } = useMemo(() => {
    switch (selectedFilter) {
      case 'unlocked':
        return { unlocked: unlockedAchievements, locked: [] };
      case 'locked':
        return { unlocked: [], locked: lockedAchievements };
      default:
        return { unlocked: unlockedAchievements, locked: lockedAchievements };
    }
  }, [selectedFilter, unlockedAchievements, lockedAchievements]);

  const renderAchievement = (achievement: Achievement, isLocked: boolean) => (
    <Card
      key={achievement.id}
      style={
        isLocked ? [styles.achievementCard, styles.lockedCard] : styles.achievementCard
      }
    >
      <View style={styles.achievementContent}>
        <View
          style={[
            styles.achievementIconContainer,
            { backgroundColor: isLocked ? colors.gray[100] : `${colors.accent}15` },
          ]}
        >
          <Ionicons
            name={isLocked ? 'lock-closed' : 'trophy'}
            size={26}
            color={isLocked ? colors.gray[400] : colors.accent}
          />
        </View>

        <View style={styles.achievementInfo}>
          <View style={styles.achievementHeader}>
            <Text
              style={[
                styles.achievementName,
                { color: isLocked ? colors.text.secondary : colors.text.primary },
              ]}
              numberOfLines={1}
            >
              {achievement.title}
            </Text>
            {!isLocked && (
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            )}
          </View>

          <Text
            style={[styles.achievementDescription, { color: colors.text.secondary }]}
            numberOfLines={2}
          >
            {achievement.description}
          </Text>

          {isLocked && achievement.requiredValue != null ? (
            <View style={styles.progressSection}>
              <ProgressBar
                progress={Math.min(
                  (achievement.currentProgress / achievement.requiredValue) * 100,
                  100
                )}
                color={colors.primary}
                height={6}
              />
              <Text style={[styles.progressText, { color: colors.text.secondary }]}>
                {achievement.currentProgress} / {achievement.requiredValue}
              </Text>
            </View>
          ) : !isLocked && achievement.unlockedAt ? (
            <Text style={[styles.achievementDate, { color: colors.success }]}>
              {t('unlockedOn', { date: formatDateOnly(achievement.unlockedAt) })}
            </Text>
          ) : null}
        </View>
      </View>

      <Badge
        label={ACHIEVEMENT_TYPE_LABELS[achievement.type] ?? achievement.type}
        variant={isLocked ? 'secondary' : 'primary'}
        size="sm"
      />
    </Card>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        {showBack && (
          <PressableScale
            onPress={() => router.back()}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel={t('backA11y')}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </PressableScale>
        )}
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text.primary },
            showBack && styles.centeredHeaderTitle,
          ]}
        >
          {t('title')}
        </Text>
        {showBack && <View style={styles.headerButton} />}
      </View>

      {isLoading ? (
        <SkeletonList count={4} lines={2} style={{ paddingHorizontal: spacing.lg }} />
      ) : error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <View>
                <Text style={[styles.progressCardTitle, { color: colors.text.primary }]}>
                  {t('progressTitle')}
                </Text>
                <Text
                  style={[styles.progressCardSubtitle, { color: colors.text.secondary }]}
                >
                  {t('progressSubtitle', {
                    unlocked: unlockedAchievements.length,
                    total,
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.percentageCircle,
                  { backgroundColor: `${colors.accent}15` },
                ]}
              >
                <Text style={[styles.percentageText, { color: colors.accent }]}>
                  {completionPct}%
                </Text>
              </View>
            </View>

            <ProgressBar progress={completionPct} color={colors.accent} height={10} />

            <View style={[styles.statsRow, { borderTopColor: colors.gray[100] }]}>
              <View style={styles.miniStat}>
                <Ionicons name="trophy" size={18} color={colors.accent} />
                <Text style={[styles.miniStatValue, { color: colors.text.primary }]}>
                  {unlockedAchievements.length}
                </Text>
                <Text style={[styles.miniStatLabel, { color: colors.text.secondary }]}>
                  {t('stats.earned')}
                </Text>
              </View>
              <View
                style={[styles.miniStatDivider, { backgroundColor: colors.gray[200] }]}
              />
              <View style={styles.miniStat}>
                <Ionicons name="hourglass-outline" size={18} color={colors.primary} />
                <Text style={[styles.miniStatValue, { color: colors.text.primary }]}>
                  {lockedAchievements.length}
                </Text>
                <Text style={[styles.miniStatLabel, { color: colors.text.secondary }]}>
                  {t('stats.pending')}
                </Text>
              </View>
              <View
                style={[styles.miniStatDivider, { backgroundColor: colors.gray[200] }]}
              />
              <View style={styles.miniStat}>
                <Ionicons name="star" size={18} color={colors.warning} />
                <Text style={[styles.miniStatValue, { color: colors.text.primary }]}>
                  {total}
                </Text>
                <Text style={[styles.miniStatLabel, { color: colors.text.secondary }]}>
                  {t('stats.total')}
                </Text>
              </View>
            </View>
          </Card>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {FILTERS.map((filter) => (
              <Chip
                key={filter.value}
                label={filter.label}
                selected={selectedFilter === filter.value}
                onPress={() => setSelectedFilter(filter.value)}
              />
            ))}
          </ScrollView>

          {unlocked.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  {t('sections.unlocked')}
                </Text>
                <Text style={[styles.sectionCount, { color: colors.text.secondary }]}>
                  {unlocked.length}
                </Text>
              </View>
              {unlocked.map((a) => renderAchievement(a, false))}
            </View>
          )}

          {locked.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  {t('sections.locked')}
                </Text>
                <Text style={[styles.sectionCount, { color: colors.text.secondary }]}>
                  {locked.length}
                </Text>
              </View>
              {locked.map((a) => renderAchievement(a, true))}
            </View>
          )}

          {total === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={64} color={colors.gray[300]} />
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                {t('empty.title')}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                {t('empty.subtitle')}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

export default function AchievementsTabScreen() {
  return <AchievementsScreenContent />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { ...typography.styles.h2 },
  centeredHeaderTitle: {
    ...typography.styles.h3,
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: { marginTop: spacing.xl },
  errorText: { ...typography.styles.body, textAlign: 'center', marginTop: spacing.xl },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing['3xl'],
  },
  progressCard: { marginBottom: spacing.lg },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressCardTitle: { ...typography.styles.h4 },
  progressCardSubtitle: { ...typography.styles.caption, marginTop: 2 },
  percentageCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: { ...typography.styles.h4 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  miniStat: { alignItems: 'center', flex: 1 },
  miniStatValue: { ...typography.styles.h4, marginTop: spacing.xs },
  miniStatLabel: { ...typography.styles.small },
  miniStatDivider: { width: 1 },
  filterContainer: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  filterContent: { paddingHorizontal: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.styles.h4 },
  sectionCount: { ...typography.styles.bodyMedium },
  achievementCard: { marginBottom: spacing.md },
  lockedCard: { opacity: 0.7 },
  achievementContent: { flexDirection: 'row', marginBottom: spacing.sm },
  achievementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  achievementInfo: { flex: 1 },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  achievementName: { ...typography.styles.bodyMedium, flex: 1, marginRight: spacing.xs },
  achievementDescription: { ...typography.styles.caption, marginBottom: spacing.sm },
  achievementDate: { ...typography.styles.small },
  progressSection: { marginTop: spacing.xs },
  progressText: { ...typography.styles.small, textAlign: 'right', marginTop: spacing.xs },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    ...typography.styles.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: { ...typography.styles.body, textAlign: 'center', lineHeight: 22 },
});

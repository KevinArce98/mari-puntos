import React, { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Card, Chip, ProgressBar } from '@/components/ui';
import { useAchievements, useThemedColors } from '@/hooks';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { Achievement, AchievementType } from '@/types';
import { formatDateOnly } from '@/utils/dateUtils';

const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Desbloqueados', value: 'unlocked' },
  { label: 'Bloqueados', value: 'locked' },
] as const;

type FilterValue = (typeof FILTERS)[number]['value'];

const ACHIEVEMENT_TYPE_LABELS: Record<AchievementType, string> = {
  [AchievementType.POINTS_MILESTONE]: 'Puntos',
  [AchievementType.LEVEL_MILESTONE]: 'Nivel',
  [AchievementType.ACTIONS_COMPLETED]: 'Acciones',
  [AchievementType.PERMISSIONS_GRANTED]: 'Permisos',
  [AchievementType.STREAK]: 'Racha',
  [AchievementType.SPECIAL]: 'Especial',
};

export default function AchievementsTabScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemedColors();
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
          <Text style={styles.achievementIcon}>{isLocked ? '🔒' : '🏆'}</Text>
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
              Desbloqueado el {formatDateOnly(achievement.unlockedAt)}
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
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Logros</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Card */}
          <Card style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <View>
                <Text style={[styles.progressCardTitle, { color: colors.text.primary }]}>
                  Tu progreso
                </Text>
                <Text
                  style={[styles.progressCardSubtitle, { color: colors.text.secondary }]}
                >
                  {unlockedAchievements.length} de {total} logros
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
                  Ganados
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
                  Pendientes
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
                  Total
                </Text>
              </View>
            </View>
          </Card>

          {/* Filter Chips */}
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

          {/* Unlocked */}
          {unlocked.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  🏆 Desbloqueados
                </Text>
                <Text style={[styles.sectionCount, { color: colors.text.secondary }]}>
                  {unlocked.length}
                </Text>
              </View>
              {unlocked.map((a) => renderAchievement(a, false))}
            </View>
          )}

          {/* Locked */}
          {locked.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  🔒 Por desbloquear
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
                Sin logros aún
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                ¡Empieza a completar acciones para desbloquear logros!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.styles.h2 },
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
    ...shadows.sm,
  },
  achievementIcon: { fontSize: 28 },
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

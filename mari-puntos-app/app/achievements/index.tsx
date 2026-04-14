import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Badge } from '@/components/ui';
import { typography, spacing, borderRadius } from '@/theme';
import { formatDateOnly } from '@/utils/dateUtils';
import { useAchievements, useThemedColors } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Achievement, AchievementType } from '@/types';

const ACHIEVEMENT_TYPE_LABELS: Record<AchievementType, string> = {
  [AchievementType.POINTS_MILESTONE]: 'Puntos',
  [AchievementType.LEVEL_MILESTONE]: 'Nivel',
  [AchievementType.ACTIONS_COMPLETED]: 'Acciones',
  [AchievementType.PERMISSIONS_GRANTED]: 'Permisos',
  [AchievementType.STREAK]: 'Racha',
  [AchievementType.SPECIAL]: 'Especial',
};

export default function AchievementsScreen() {
  const themeColors = useThemedColors();
  const insets = useSafeAreaInsets();
  const { unlockedAchievements, lockedAchievements, isLoading, error } =
    useAchievements();

  const total = unlockedAchievements.length + lockedAchievements.length;
  const completionPct =
    total > 0 ? Math.round((unlockedAchievements.length / total) * 100) : 0;

  const renderAchievement = (achievement: Achievement, isLocked: boolean) => (
    <Card
      key={achievement.id}
      style={[styles.achievementCard, isLocked ? styles.lockedCard : {}]}
    >
      <View style={styles.achievementHeader}>
        <Text style={[styles.achievementIcon, isLocked && styles.lockedIcon]}>
          {isLocked ? '🔒' : '🏆'}
        </Text>
        <View style={styles.achievementInfo}>
          <Text
            style={[
              styles.achievementName,
              { color: isLocked ? themeColors.text.light : themeColors.text.primary },
            ]}
          >
            {achievement.title}
          </Text>
          <Text
            style={[styles.achievementDescription, { color: themeColors.text.secondary }]}
          >
            {achievement.description}
          </Text>
          {!isLocked && achievement.unlockedAt && (
            <Text style={[styles.achievementDate, { color: themeColors.success }]}>
              Desbloqueado el {formatDateOnly(achievement.unlockedAt)}
            </Text>
          )}
        </View>
      </View>

      {isLocked && achievement.requiredValue != null && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: themeColors.gray[200] }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: themeColors.primary },
                {
                  width: `${Math.min(
                    (achievement.currentProgress / achievement.requiredValue) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: themeColors.text.secondary }]}>
            {achievement.currentProgress} / {achievement.requiredValue}
          </Text>
        </View>
      )}

      <Badge
        label={ACHIEVEMENT_TYPE_LABELS[achievement.type] ?? achievement.type}
        variant="primary"
        size="sm"
        style={styles.typeBadge}
      />
    </Card>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background, paddingTop: insets.top },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>Logros</Text>
        <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
          Completa desafíos y desbloquea logros especiales
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={themeColors.primary}
            style={styles.loader}
          />
        ) : error ? (
          <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
        ) : (
          <>
            {/* Stats */}
            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Text style={[styles.statValue, { color: themeColors.primary }]}>
                  {unlockedAchievements.length}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                  Desbloqueados
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statValue, { color: themeColors.primary }]}>
                  {lockedAchievements.length}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                  Por desbloquear
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statValue, { color: themeColors.primary }]}>
                  {completionPct}%
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                  Completado
                </Text>
              </Card>
            </View>

            {/* Unlocked */}
            {unlockedAchievements.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                  🏆 Logros desbloqueados ({unlockedAchievements.length})
                </Text>
                {unlockedAchievements.map((a) => renderAchievement(a, false))}
              </View>
            )}

            {/* Locked */}
            {lockedAchievements.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                  🔒 Logros bloqueados ({lockedAchievements.length})
                </Text>
                {lockedAchievements.map((a) => renderAchievement(a, true))}
              </View>
            )}

            {total === 0 && (
              <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
                Aún no tienes logros. ¡Comienza a ganar puntos!
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  title: { ...typography.styles.h2, marginBottom: spacing.sm },
  subtitle: { ...typography.styles.body, marginBottom: spacing.xl },
  loader: { marginTop: spacing.xl },
  errorText: { ...typography.styles.body, textAlign: 'center', marginTop: spacing.xl },
  emptyText: { ...typography.styles.body, textAlign: 'center', marginTop: spacing.xl },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    padding: spacing.md,
  },
  statValue: { ...typography.styles.h2, marginBottom: spacing.xs },
  statLabel: { ...typography.styles.small, textAlign: 'center' },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.styles.h4, marginBottom: spacing.md },
  achievementCard: { marginBottom: spacing.md },
  lockedCard: { opacity: 0.7 },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementIcon: { fontSize: 48, marginRight: spacing.md },
  lockedIcon: { opacity: 0.5 },
  achievementInfo: { flex: 1 },
  achievementName: { ...typography.styles.h4, marginBottom: spacing.xs / 2 },
  achievementDescription: { ...typography.styles.caption, marginBottom: spacing.xs },
  achievementDate: { ...typography.styles.small },
  progressContainer: { marginBottom: spacing.md },
  progressBar: {
    height: 6,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: { height: '100%' },
  progressText: { ...typography.styles.small, textAlign: 'right' },
  typeBadge: { alignSelf: 'flex-start' },
});

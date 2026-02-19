import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Badge } from '@/components/ui';
import { typography, spacing, borderRadius } from '@/theme';
import { formatDateOnly } from '@/utils/dateUtils';
import { useRewards, useThemedColors } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AchievementsScreen() {
  const themeColors = useThemedColors();
  const insets = useSafeAreaInsets();
  const { allRewards, availableRewards } = useRewards();

  const renderAchievement = (achievement: any, isLocked: boolean) => (
    <Card
      key={achievement.id}
      style={[styles.achievementCard, isLocked ? styles.lockedCard : {}]}
    >
      <View style={styles.achievementHeader}>
        <Text style={[styles.achievementIcon, isLocked && styles.lockedIcon]}>
          {isLocked ? '🔒' : achievement.icon}
        </Text>
        <View style={styles.achievementInfo}>
          <Text
            style={[
              styles.achievementName,
              { color: themeColors.text.primary },
              isLocked && { color: themeColors.text.light },
            ]}
          >
            {achievement.name}
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

      {isLocked && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: themeColors.gray[200] }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: themeColors.primary },
                {
                  width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: themeColors.text.secondary }]}>
            {achievement.progress} / {achievement.requirement}
          </Text>
        </View>
      )}

      <Badge
        label={achievement.type}
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

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: themeColors.primary }]}>
              {availableRewards.length}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
              Desbloqueados
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: themeColors.primary }]}>
              {allRewards.length - availableRewards.length}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
              Por desbloquear
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: themeColors.primary }]}>
              {Math.round((availableRewards.length / allRewards.length) * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
              Completado
            </Text>
          </Card>
        </View>

        {/* Unlocked Achievements */}
        {availableRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
              🏆 Logros desbloqueados ({availableRewards.length})
            </Text>
            {availableRewards.map((achievement) => renderAchievement(achievement, false))}
          </View>
        )}

        {/* Locked Achievements */}
        {allRewards.length - availableRewards.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
              🔒 Logros bloqueados ({allRewards.length - availableRewards.length})
            </Text>
            {availableRewards.map((achievement) => renderAchievement(achievement, true))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.styles.h2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    marginBottom: spacing.xl,
  },
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
  statValue: {
    ...typography.styles.h2,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.styles.small,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.md,
  },
  achievementCard: {
    marginBottom: spacing.md,
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementIcon: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    ...typography.styles.h4,
    marginBottom: spacing.xs / 2,
  },
  lockedText: {},
  achievementDescription: {
    ...typography.styles.caption,
    marginBottom: spacing.xs,
  },
  achievementDate: {
    ...typography.styles.small,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    ...typography.styles.small,
    textAlign: 'right',
  },
  typeBadge: {
    alignSelf: 'flex-start',
  },
});

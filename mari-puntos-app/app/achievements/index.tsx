import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Card, Badge } from '@/components/ui';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { formatDateOnly } from '@/utils/dateUtils';
import { useRewards } from '@/hooks';

export default function AchievementsScreen() {
  const { unlockedAchievements, lockedAchievements } = useRewards();

  const renderAchievement = (achievement: any, isLocked: boolean) => (
    <Card key={achievement.id} style={[styles.achievementCard, isLocked && styles.lockedCard]}>
      <View style={styles.achievementHeader}>
        <Text style={[styles.achievementIcon, isLocked && styles.lockedIcon]}>
          {isLocked ? '🔒' : achievement.icon}
        </Text>
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementName, isLocked && styles.lockedText]}>
            {achievement.name}
          </Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>
          {!isLocked && achievement.unlockedAt && (
            <Text style={styles.achievementDate}>
              Desbloqueado el {formatDateOnly(achievement.unlockedAt)}
            </Text>
          )}
        </View>
      </View>
      
      {isLocked && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Logros</Text>
        <Text style={styles.subtitle}>
          Completa desafíos y desbloquea logros especiales
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{unlockedAchievements.length}</Text>
            <Text style={styles.statLabel}>Desbloqueados</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{lockedAchievements.length}</Text>
            <Text style={styles.statLabel}>Por desbloquear</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round((unlockedAchievements.length / (unlockedAchievements.length + lockedAchievements.length)) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Completado</Text>
          </Card>
        </View>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🏆 Logros desbloqueados ({unlockedAchievements.length})
            </Text>
            {unlockedAchievements.map((achievement) => renderAchievement(achievement, false))}
          </View>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🔒 Logros bloqueados ({lockedAchievements.length})
            </Text>
            {lockedAchievements.map((achievement) => renderAchievement(achievement, true))}
          </View>
        )}
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
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
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
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.styles.small,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
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
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  lockedText: {
    color: colors.text.light,
  },
  achievementDescription: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  achievementDate: {
    ...typography.styles.small,
    color: colors.success,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.styles.small,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  typeBadge: {
    alignSelf: 'flex-start',
  },
});

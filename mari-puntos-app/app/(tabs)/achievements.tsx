import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Card, Chip, ProgressBar } from '@/components/ui';
import { useRewards, useThemedColors } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

const FILTERS = ['All', 'Unlocked', 'In Progress'];

export default function AchievementsTabScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { allRewards, availableRewards } = useRewards();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const totalAchievements = allRewards.length;
  const completionPercentage =
    totalAchievements > 0
      ? Math.round((availableRewards.length / totalAchievements) * 100)
      : 0;

  const filteredAchievements = () => {
    switch (selectedFilter) {
      case 'Unlocked':
        return { unlocked: availableRewards, locked: [] };
      case 'In Progress':
        return {
          unlocked: [],
          locked: allRewards.filter((a) => !availableRewards.includes(a)),
        };
      default:
        return {
          unlocked: availableRewards,
          locked: allRewards.filter((a) => !availableRewards.includes(a)),
        };
    }
  };

  const { unlocked, locked } = filteredAchievements();

  const renderAchievement = (achievement: any, isLocked: boolean) => {
    const cardStyle = isLocked
      ? { ...styles.achievementCard, ...styles.lockedCard }
      : styles.achievementCard;

    return (
      <Card key={achievement.id} style={cardStyle}>
        <View style={styles.achievementContent}>
          <View
            style={[
              styles.achievementIconContainer,
              { backgroundColor: `${themeColors.accent}15` },
              isLocked && { backgroundColor: themeColors.gray[100] },
            ]}
          >
            <Text style={styles.achievementIcon}>
              {isLocked ? '🔒' : achievement.icon || '🏆'}
            </Text>
          </View>

          <View style={styles.achievementInfo}>
            <View style={styles.achievementHeader}>
              <Text
                style={[styles.achievementName, isLocked ? styles.lockedText : undefined]}
              >
                {achievement.name}
              </Text>
              {!isLocked && (
                <View style={styles.unlockedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={themeColors.success}
                  />
                </View>
              )}
            </View>

            <Text style={[styles.achievementDescription, { color: themeColors.text.secondary }]} numberOfLines={2}>
              {achievement.description}
            </Text>

            {isLocked ? (
              <View style={styles.progressSection}>
                <ProgressBar
                  progress={Math.min(
                    (achievement.progress / achievement.requirement) * 100,
                    100
                  )}
                  color={themeColors.primary}
                  height={6}
                />
                <Text style={[styles.progressText, { color: themeColors.text.secondary }]}>
                  {achievement.progress} / {achievement.requirement}
                </Text>
              </View>
            ) : (
              <Text style={[styles.achievementDate, { color: themeColors.success }]}>
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        <Badge
          label={achievement.type || 'achievement'}
          variant={isLocked ? 'secondary' : 'primary'}
          size="sm"
        />
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>Achievements</Text>
        <TouchableOpacity style={[styles.infoButton, { backgroundColor: themeColors.gray[100] }]}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={themeColors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressCardHeader}>
            <View>
              <Text style={[styles.progressCardTitle, { color: themeColors.text.primary }]}>Your Progress</Text>
              <Text style={[styles.progressCardSubtitle, { color: themeColors.text.secondary }]}>
                {unlocked.length} of {totalAchievements} achievements
              </Text>
            </View>
            <View style={[styles.percentageCircle, { backgroundColor: `${themeColors.accent}15` }]}>
              <Text style={[styles.percentageText, { color: themeColors.accent }]}>{completionPercentage}%</Text>
            </View>
          </View>

          <ProgressBar
            progress={completionPercentage}
            color={themeColors.accent}
            height={10}
          />

          <View style={[styles.statsRow, { borderTopColor: themeColors.gray[100] }]}>
            <View style={styles.miniStat}>
              <Ionicons name="trophy" size={18} color={themeColors.accent} />
              <Text style={[styles.miniStatValue, { color: themeColors.text.primary }]}>{unlocked.length}</Text>
              <Text style={[styles.miniStatLabel, { color: themeColors.text.secondary }]}>Unlocked</Text>
            </View>
            <View style={[styles.miniStatDivider, { backgroundColor: themeColors.gray[200] }]} />
            <View style={styles.miniStat}>
              <Ionicons name="hourglass-outline" size={18} color={themeColors.primary} />
              <Text style={[styles.miniStatValue, { color: themeColors.text.primary }]}>{locked.length}</Text>
              <Text style={[styles.miniStatLabel, { color: themeColors.text.secondary }]}>In Progress</Text>
            </View>
            <View style={[styles.miniStatDivider, { backgroundColor: themeColors.gray[200] }]} />
            <View style={styles.miniStat}>
              <Ionicons name="star" size={18} color={themeColors.warning} />
              <Text style={[styles.miniStatValue, { color: themeColors.text.primary }]}>{totalAchievements}</Text>
              <Text style={[styles.miniStatLabel, { color: themeColors.text.secondary }]}>Total</Text>
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
              key={filter}
              label={filter}
              selected={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
            />
          ))}
        </ScrollView>

        {/* Unlocked Achievements */}
        {unlocked.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>🏆 Unlocked</Text>
              <Text style={[styles.sectionCount, { color: themeColors.text.secondary }]}>{unlocked.length}</Text>
            </View>
            {unlocked.map((achievement: any) => renderAchievement(achievement, false))}
          </View>
        )}

        {/* Locked Achievements */}
        {locked.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>🔒 In Progress</Text>
              <Text style={[styles.sectionCount, { color: themeColors.text.secondary }]}>{locked.length}</Text>
            </View>
            {locked.map((achievement: any) => renderAchievement(achievement, true))}
          </View>
        )}

        {/* Empty State */}
        {unlocked.length === 0 && locked.length === 0 && (
          <Card style={styles.emptyCard}>
            <View style={[styles.emptyIconContainer, { backgroundColor: themeColors.gray[100] }]}>
              <Ionicons name="trophy-outline" size={48} color={themeColors.gray[400]} />
            </View>
            <Text style={[styles.emptyTitle, { color: themeColors.text.primary }]}>No Achievements Yet</Text>
            <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
              Start completing actions to unlock achievements!
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.styles.h2,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing['3xl'],
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressCardTitle: {
    ...typography.styles.h4,
  },
  progressCardSubtitle: {
    ...typography.styles.caption,
    marginTop: 2,
  },
  percentageCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    ...typography.styles.h4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatValue: {
    ...typography.styles.h4,
    marginTop: spacing.xs,
  },
  miniStatLabel: {
    ...typography.styles.small,
  },
  miniStatDivider: {
    width: 1,
  },
  filterContainer: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
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
  },
  sectionCount: {
    ...typography.styles.bodyMedium,
  },
  achievementCard: {
    marginBottom: spacing.md,
  },
  lockedCard: {
    opacity: 0.85,
  },
  achievementContent: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  achievementIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementName: {
    ...typography.styles.bodyMedium,
    flex: 1,
  },
  unlockedBadge: {
    marginLeft: spacing.sm,
  },
  achievementDescription: {
    ...typography.styles.caption,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressText: {
    ...typography.styles.small,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  achievementDate: {
    ...typography.styles.small,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.styles.body,
    textAlign: 'center',
  },
});

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Card, Chip, ProgressBar } from '@/components/ui';
import { useRewards } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

const FILTERS = ['All', 'Unlocked', 'In Progress'];

export default function AchievementsTabScreen() {
  const insets = useSafeAreaInsets();
  const { unlockedAchievements, lockedAchievements } = useRewards();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const totalAchievements = unlockedAchievements.length + lockedAchievements.length;
  const completionPercentage = totalAchievements > 0
    ? Math.round((unlockedAchievements.length / totalAchievements) * 100)
    : 0;

  const filteredAchievements = () => {
    switch (selectedFilter) {
      case 'Unlocked':
        return { unlocked: unlockedAchievements, locked: [] };
      case 'In Progress':
        return { unlocked: [], locked: lockedAchievements };
      default:
        return { unlocked: unlockedAchievements, locked: lockedAchievements };
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
          <View style={[
            styles.achievementIconContainer,
            isLocked ? styles.lockedIconContainer : undefined,
          ]}>
            <Text style={styles.achievementIcon}>
              {isLocked ? '🔒' : achievement.icon || '🏆'}
            </Text>
          </View>
          
          <View style={styles.achievementInfo}>
            <View style={styles.achievementHeader}>
              <Text style={[styles.achievementName, isLocked ? styles.lockedText : undefined]}>
                {achievement.name}
              </Text>
              {!isLocked && (
                <View style={styles.unlockedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                </View>
              )}
            </View>
            
            <Text style={styles.achievementDescription} numberOfLines={2}>
              {achievement.description}
            </Text>
            
            {isLocked ? (
              <View style={styles.progressSection}>
                <ProgressBar 
                  progress={Math.min((achievement.progress / achievement.requirement) * 100, 100)} 
                  color={colors.primary}
                  height={6}
                />
                <Text style={styles.progressText}>
                  {achievement.progress} / {achievement.requirement}
                </Text>
              </View>
            ) : (
              <Text style={styles.achievementDate}>
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={colors.text.primary} />
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
              <Text style={styles.progressCardTitle}>Your Progress</Text>
              <Text style={styles.progressCardSubtitle}>
                {unlockedAchievements.length} of {totalAchievements} achievements
              </Text>
            </View>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageText}>{completionPercentage}%</Text>
            </View>
          </View>
          
          <ProgressBar 
            progress={completionPercentage} 
            color={colors.accent}
            height={10}
          />
          
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <Ionicons name="trophy" size={18} color={colors.accent} />
              <Text style={styles.miniStatValue}>{unlockedAchievements.length}</Text>
              <Text style={styles.miniStatLabel}>Unlocked</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Ionicons name="hourglass-outline" size={18} color={colors.primary} />
              <Text style={styles.miniStatValue}>{lockedAchievements.length}</Text>
              <Text style={styles.miniStatLabel}>In Progress</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Ionicons name="star" size={18} color={colors.warning} />
              <Text style={styles.miniStatValue}>{totalAchievements}</Text>
              <Text style={styles.miniStatLabel}>Total</Text>
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
              <Text style={styles.sectionTitle}>🏆 Unlocked</Text>
              <Text style={styles.sectionCount}>{unlocked.length}</Text>
            </View>
            {unlocked.map((achievement: any) => renderAchievement(achievement, false))}
          </View>
        )}

        {/* Locked Achievements */}
        {locked.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔒 In Progress</Text>
              <Text style={styles.sectionCount}>{locked.length}</Text>
            </View>
            {locked.map((achievement: any) => renderAchievement(achievement, true))}
          </View>
        )}

        {/* Empty State */}
        {unlocked.length === 0 && locked.length === 0 && (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="trophy-outline" size={48} color={colors.gray[400]} />
            </View>
            <Text style={styles.emptyTitle}>No Achievements Yet</Text>
            <Text style={styles.emptyText}>
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
    backgroundColor: colors.background,
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
    color: colors.text.primary,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
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
    color: colors.text.primary,
  },
  progressCardSubtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  percentageCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    ...typography.styles.h4,
    color: colors.accent,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatValue: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  miniStatLabel: {
    ...typography.styles.small,
    color: colors.text.secondary,
  },
  miniStatDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
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
    color: colors.text.primary,
  },
  sectionCount: {
    ...typography.styles.bodyMedium,
    color: colors.text.secondary,
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
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  lockedIconContainer: {
    backgroundColor: colors.gray[100],
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
    color: colors.text.primary,
    flex: 1,
  },
  lockedText: {
    color: colors.text.secondary,
  },
  unlockedBadge: {
    marginLeft: spacing.sm,
  },
  achievementDescription: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressText: {
    ...typography.styles.small,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  achievementDate: {
    ...typography.styles.small,
    color: colors.success,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

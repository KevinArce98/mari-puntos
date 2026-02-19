import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Card, Chip, ProgressBar } from '@/components/ui';
import { usePoints, useThemedColors, useUser } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

const TIME_PERIODS = ['This Week', 'This Month', 'All Time'];

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { user, partnerInfo } = useUser();
  const { myPoints, partnerPoints } = usePoints();
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');

  // Calculate who's winning
  const userWinning = myPoints >= partnerPoints;
  const totalPoints = myPoints + partnerPoints;
  const myPercentage = totalPoints > 0 ? (myPoints / totalPoints) * 100 : 50;

  // Mock weekly stats
  const weeklyStats = {
    actionsCompleted: 12,
    pointsEarned: 245,
    streak: 5,
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
          Ranking
        </Text>
        <TouchableOpacity
          style={[styles.historyButton, { backgroundColor: themeColors.gray[100] }]}
        >
          <Ionicons name="time-outline" size={24} color={themeColors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Period Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.periodContainer}
          contentContainerStyle={styles.periodContent}
        >
          {TIME_PERIODS.map((period) => (
            <Chip
              key={period}
              label={period}
              selected={selectedPeriod === period}
              onPress={() => setSelectedPeriod(period)}
            />
          ))}
        </ScrollView>

        {/* Competition Card */}
        <Card style={styles.competitionCard} padding="none">
          <LinearGradient
            colors={[themeColors.primary, themeColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.competitionGradient}
          >
            <Text style={styles.competitionTitle}>
              {userWinning ? "You're Winning! 🎉" : 'Keep Going! 💪'}
            </Text>

            {/* VS Display */}
            <View style={styles.vsContainer}>
              <View style={styles.playerColumn}>
                <Avatar imageUri={user?.avatarUrl} name={user?.firstName} size="lg" />
                <Text style={styles.playerName}>{user?.firstName || 'You'}</Text>
                <Text style={styles.playerPoints}>{myPoints.toLocaleString()}</Text>
              </View>

              <View style={styles.vsCenter}>
                <View style={styles.vsBadge}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
              </View>

              <View style={styles.playerColumn}>
                <Avatar
                  imageUri={partnerInfo?.partner?.avatarUrl}
                  name={partnerInfo?.partner?.firstName}
                  size="lg"
                />
                <Text style={styles.playerName}>
                  {partnerInfo?.partner?.firstName || 'Partner'}
                </Text>
                <Text style={styles.playerPoints}>{partnerPoints.toLocaleString()}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${myPercentage}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>{Math.round(myPercentage)}%</Text>
                <Text style={styles.progressLabel}>
                  {Math.round(100 - myPercentage)}%
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Weekly Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
            Your Stats
          </Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View
                style={[styles.statIcon, { backgroundColor: `${themeColors.primary}15` }]}
              >
                <Ionicons name="checkmark-circle" size={24} color={themeColors.primary} />
              </View>
              <Text style={[styles.statValue, { color: themeColors.text.primary }]}>
                {weeklyStats.actionsCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                Actions
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <View
                style={[styles.statIcon, { backgroundColor: `${themeColors.accent}15` }]}
              >
                <Ionicons name="trophy" size={24} color={themeColors.accent} />
              </View>
              <Text style={[styles.statValue, { color: themeColors.text.primary }]}>
                {weeklyStats.pointsEarned}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                Points
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <View
                style={[styles.statIcon, { backgroundColor: `${themeColors.error}15` }]}
              >
                <Ionicons name="flame" size={24} color={themeColors.error} />
              </View>
              <Text style={[styles.statValue, { color: themeColors.text.primary }]}>
                {weeklyStats.streak}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text.secondary }]}>
                Day Streak
              </Text>
            </Card>
          </View>
        </View>

        {/* Weekly Goal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
              Weekly Goal
            </Text>
            <Text style={[styles.goalProgress, { color: themeColors.accent }]}>
              245 / 500 pts
            </Text>
          </View>
          <Card style={styles.goalCard}>
            <ProgressBar progress={49} color={themeColors.accent} height={12} />
            <Text style={[styles.goalText, { color: themeColors.text.secondary }]}>
              Earn 255 more points to reach your weekly goal!
            </Text>
          </Card>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
            Recent Activity
          </Text>
          <Card padding="none" style={styles.activityCard}>
            {[
              {
                action: 'Washed dishes',
                points: 15,
                time: '2h ago',
                icon: 'water-outline',
              },
              {
                action: 'Made breakfast',
                points: 20,
                time: '5h ago',
                icon: 'restaurant-outline',
              },
              {
                action: 'Cleaned room',
                points: 25,
                time: '1d ago',
                icon: 'home-outline',
              },
            ].map((item, index) => (
              <View
                key={index}
                style={[
                  styles.activityItem,
                  index < 2 && {
                    borderBottomWidth: 1,
                    borderBottomColor: themeColors.gray[100],
                  },
                ]}
              >
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: `${themeColors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={themeColors.primary}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text
                    style={[styles.activityAction, { color: themeColors.text.primary }]}
                  >
                    {item.action}
                  </Text>
                  <Text
                    style={[styles.activityTime, { color: themeColors.text.secondary }]}
                  >
                    {item.time}
                  </Text>
                </View>
                <Text style={[styles.activityPoints, { color: themeColors.primary }]}>
                  +{item.points}
                </Text>
              </View>
            ))}
          </Card>
        </View>
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
  historyButton: {
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
  periodContainer: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  periodContent: {
    paddingHorizontal: spacing.lg,
  },
  competitionCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  competitionGradient: {
    padding: spacing.lg,
  },
  competitionTitle: {
    ...typography.styles.h3,
    color: colors.light.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  playerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  playerName: {
    ...typography.styles.bodyMedium,
    color: colors.light.white,
    marginTop: spacing.sm,
  },
  playerPoints: {
    ...typography.styles.h3,
    color: colors.light.accent,
    marginTop: spacing.xs,
  },
  vsCenter: {
    paddingHorizontal: spacing.md,
  },
  vsBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    ...typography.styles.bodyMedium,
    color: colors.light.white,
    fontFamily: typography.fontFamily.bold,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.light.accent,
    borderRadius: borderRadius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  progressLabel: {
    ...typography.styles.small,
    color: 'rgba(255, 255, 255, 0.8)',
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
  goalProgress: {
    ...typography.styles.bodyMedium,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.styles.h3,
  },
  statLabel: {
    ...typography.styles.caption,
    marginTop: 2,
  },
  goalCard: {
    marginTop: -spacing.sm,
  },
  goalText: {
    ...typography.styles.caption,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  activityCard: {
    marginTop: -spacing.sm,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    ...typography.styles.bodyMedium,
  },
  activityTime: {
    ...typography.styles.caption,
    marginTop: 2,
  },
  activityPoints: {
    ...typography.styles.h4,
  },
});

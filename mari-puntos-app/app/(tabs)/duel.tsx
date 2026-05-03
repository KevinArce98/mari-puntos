import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Card } from '@/components/ui';
import { useThemedColors, useUser } from '@/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';

export default function CompetitionScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { user, partnerInfo } = useUser();

  const myPoints = user?.totalPoints || 0;
  const myLevel = user?.currentLevel || 1;
  const partnerPoints = partnerInfo?.partner?.totalPoints || 0;
  const partnerLevel = partnerInfo?.partner?.currentLevel || 1;

  const totalPoints = myPoints + partnerPoints;
  const myPercentage = totalPoints > 0 ? (myPoints / totalPoints) * 100 : 50;
  const userWinning = myPoints >= partnerPoints;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
          Duelo
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.competitionCard} padding="none">
          <LinearGradient
            colors={[themeColors.primary, themeColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.competitionGradient}
          >
            <Text style={styles.competitionTitle}>
              {userWinning ? '¡Vas ganando! 🎉' : '¡Sigue así! 💪'}
            </Text>

            <View style={styles.vsContainer}>
              <View style={styles.playerColumn}>
                <Avatar imageUri={user?.avatarUrl} name={user?.firstName} size="lg" />
                <Text style={styles.playerName}>{user?.firstName || 'Tú'}</Text>
                <Text style={styles.playerPoints}>{myPoints.toLocaleString()}</Text>
                <Text style={styles.playerLevel}>Nivel {myLevel}</Text>
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
                  {partnerInfo?.partner?.firstName || 'Pareja'}
                </Text>
                <Text style={styles.playerPoints}>{partnerPoints.toLocaleString()}</Text>
                <Text style={styles.playerLevel}>Nivel {partnerLevel}</Text>
              </View>
            </View>

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
      </View>
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
  content: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  competitionCard: {
    overflow: 'hidden',
  },
  competitionGradient: { padding: spacing.lg },
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
  playerColumn: { alignItems: 'center', flex: 1 },
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
  playerLevel: {
    ...typography.styles.small,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  vsCenter: { paddingHorizontal: spacing.md },
  vsBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    ...typography.styles.bodyMedium,
    color: colors.light.white,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  progressContainer: { marginTop: spacing.sm },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    color: 'rgba(255,255,255,0.8)',
  },
});

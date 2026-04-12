import React, { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { Avatar, Card } from '@/components/ui';
import { usePoints, useThemedColors, useUser } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { user, partnerInfo, hasPartner } = useUser();
  const {
    myPoints,
    partnerPoints,
    myLevel,
    partnerLevel,
    leaderboard,
    isLoading,
    fetchLeaderboard,
  } = usePoints();

  useFocusEffect(
    useCallback(() => {
      if (hasPartner) {
        fetchLeaderboard({ limit: 10 });
      }
    }, [hasPartner, fetchLeaderboard])
  );

  const totalPoints = myPoints + partnerPoints;
  const myPercentage = totalPoints > 0 ? (myPoints / totalPoints) * 100 : 50;
  const userWinning = myPoints >= partnerPoints;

  if (!hasPartner) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: themeColors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
            Ranking
          </Text>
        </View>
        <View style={styles.lockedContainer}>
          <Ionicons name="lock-closed" size={48} color={themeColors.gray[300]} />
          <Text style={[styles.lockedTitle, { color: themeColors.text.primary }]}>
            Conecta con tu pareja
          </Text>
          <Text style={[styles.lockedSubtitle, { color: themeColors.text.secondary }]}>
            El ranking estará disponible cuando estés vinculado con tu pareja
          </Text>
        </View>
      </View>
    );
  }

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
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Competition Card */}
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

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
            Tabla de posiciones
          </Text>

          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={themeColors.primary}
              style={styles.loader}
            />
          ) : leaderboard.length === 0 ? (
            <Card>
              <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
                No hay datos disponibles
              </Text>
            </Card>
          ) : (
            <Card padding="none" style={styles.leaderboardCard}>
              {leaderboard.map((entry, index) => {
                const isMe = entry.id === user?.id;
                const medal =
                  index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

                return (
                  <View
                    key={entry.id}
                    style={[
                      styles.leaderboardItem,
                      isMe && { backgroundColor: `${themeColors.primary}10` },
                      index < leaderboard.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: themeColors.gray[100],
                      },
                    ]}
                  >
                    <View style={styles.rankContainer}>
                      {medal ? (
                        <Text style={styles.medal}>{medal}</Text>
                      ) : (
                        <Text
                          style={[
                            styles.rankNumber,
                            { color: themeColors.text.secondary },
                          ]}
                        >
                          {index + 1}
                        </Text>
                      )}
                    </View>

                    <Avatar imageUri={entry.avatarUrl} name={entry.firstName} size="sm" />

                    <View style={styles.entryInfo}>
                      <Text
                        style={[styles.entryName, { color: themeColors.text.primary }]}
                      >
                        {entry.firstName} {entry.lastName}
                        {isMe ? ' (Tú)' : ''}
                      </Text>
                      <Text
                        style={[styles.entryLevel, { color: themeColors.text.secondary }]}
                      >
                        Nivel {entry.currentLevel}
                      </Text>
                    </View>

                    <Text style={[styles.entryPoints, { color: themeColors.primary }]}>
                      {entry.totalPoints.toLocaleString()} pts
                    </Text>
                  </View>
                );
              })}
            </Card>
          )}
        </View>
      </ScrollView>
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
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  lockedTitle: {
    ...typography.styles.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  lockedSubtitle: {
    ...typography.styles.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing['3xl'],
  },
  competitionCard: {
    marginBottom: spacing.lg,
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
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.md,
  },
  loader: { marginVertical: spacing.lg },
  emptyText: {
    ...typography.styles.body,
    textAlign: 'center',
  },
  leaderboardCard: { overflow: 'hidden', ...shadows.sm },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  rankContainer: {
    width: 28,
    alignItems: 'center',
  },
  medal: { fontSize: 20 },
  rankNumber: {
    ...typography.styles.bodyMedium,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  entryInfo: { flex: 1 },
  entryName: { ...typography.styles.bodyMedium },
  entryLevel: { ...typography.styles.caption, marginTop: 2 },
  entryPoints: {
    ...typography.styles.bodyMedium,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

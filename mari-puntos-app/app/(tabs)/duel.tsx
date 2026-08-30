import React, { useCallback } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Card } from '@/components/ui';
import { useThemedColors, useUser } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

export default function CompetitionScreen() {
  const { t } = useTranslation('duel');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const themeColors = useThemedColors();
  const { user, partnerInfo, hasPartner, fetchPartnerInfo } = useUser();

  useFocusEffect(
    useCallback(() => {
      if (!hasPartner) return;
      fetchPartnerInfo().catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPartner])
  );

  const myPoints = user?.totalPoints || 0;
  const myLevel = user?.currentLevel || 1;
  const partnerPoints = partnerInfo?.partner?.totalPoints || 0;
  const partnerLevel = partnerInfo?.partner?.currentLevel || 1;

  const totalPoints = myPoints + partnerPoints;
  const hasActivity = totalPoints > 0;
  const myPercentage = totalPoints > 0 ? (myPoints / totalPoints) * 100 : 50;
  const isTie = myPoints === partnerPoints;
  const resultTitle = isTie
    ? t('result.tie')
    : myPoints > partnerPoints
      ? t('result.winning')
      : t('result.losing');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
          {t('title')}
        </Text>
      </View>

      <View style={styles.content}>
        {!hasActivity ? (
          <Card style={styles.emptyCard} padding="lg">
            <View
              style={[styles.emptyIcon, { backgroundColor: themeColors.primaryTint }]}
            >
              <Ionicons name="stats-chart" size={36} color={themeColors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: themeColors.text.primary }]}>
              {t('empty.title')}
            </Text>
            <Text style={[styles.emptyText, { color: themeColors.text.secondary }]}>
              {t('empty.text')}
            </Text>
            <Button
              title={t('empty.cta')}
              onPress={() =>
                router.push({ pathname: '/(tabs)', params: { createAction: '1' } })
              }
              icon="add-circle-outline"
            />
          </Card>
        ) : (
          <Card style={styles.competitionCard} padding="lg">
            <Text style={[styles.competitionTitle, { color: themeColors.text.primary }]}>
              {resultTitle}
            </Text>
            <Text style={[styles.timeframe, { color: themeColors.text.secondary }]}>
              {t('subtitle')}
            </Text>

            <View style={styles.vsContainer}>
              <View style={styles.playerColumn}>
                <Avatar imageUri={user?.avatarUrl} name={user?.firstName} size="lg" />
                <Text style={[styles.playerName, { color: themeColors.text.primary }]}>
                  {user?.firstName || t('you')}
                </Text>
                <Text style={[styles.playerPoints, { color: themeColors.primary }]}>
                  {myPoints.toLocaleString()}
                </Text>
                <Text style={[styles.playerLevel, { color: themeColors.text.secondary }]}>
                  {t('level', { level: myLevel })}
                </Text>
              </View>

              <View style={styles.vsCenter}>
                <View
                  style={[styles.vsBadge, { backgroundColor: themeColors.primaryTint }]}
                >
                  <Text style={[styles.vsText, { color: themeColors.primary }]}>VS</Text>
                </View>
              </View>

              <View style={styles.playerColumn}>
                <Avatar
                  imageUri={partnerInfo?.partner?.avatarUrl}
                  name={partnerInfo?.partner?.firstName}
                  size="lg"
                />
                <Text style={[styles.playerName, { color: themeColors.text.primary }]}>
                  {partnerInfo?.partner?.firstName || t('partner')}
                </Text>
                <Text style={[styles.playerPoints, { color: themeColors.love }]}>
                  {partnerPoints.toLocaleString()}
                </Text>
                <Text style={[styles.playerLevel, { color: themeColors.text.secondary }]}>
                  {t('level', { level: partnerLevel })}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: themeColors.love }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${myPercentage}%`, backgroundColor: themeColors.primary },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressLabel, { color: themeColors.primary }]}>
                  {Math.round(myPercentage)}%
                </Text>
                <Text style={[styles.progressLabel, { color: themeColors.love }]}>
                  {Math.round(100 - myPercentage)}%
                </Text>
              </View>
            </View>
          </Card>
        )}
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
  competitionCard: {},
  competitionTitle: {
    ...typography.styles.h3,
    textAlign: 'center',
  },
  timeframe: {
    ...typography.styles.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
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
    marginTop: spacing.sm,
  },
  playerPoints: {
    ...typography.styles.h3,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.xs,
  },
  playerLevel: {
    ...typography.styles.small,
    marginTop: 2,
  },
  vsCenter: { paddingHorizontal: spacing.md },
  vsBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    ...typography.styles.bodyMedium,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  progressContainer: { marginTop: spacing.sm },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  progressLabel: {
    ...typography.styles.caption,
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.styles.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.styles.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

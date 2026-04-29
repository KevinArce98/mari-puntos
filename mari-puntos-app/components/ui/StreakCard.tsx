import React from 'react';

import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemedColors } from '@/hooks';
import { StreakInfo } from '@/services/streakService';
import { borderRadius, spacing, typography } from '@/theme';

import { Card } from './Card';

interface StreakCardProps {
  streak: StreakInfo;
  style?: ViewStyle;
}

export function StreakCard({ streak, style }: StreakCardProps) {
  const colors = useThemedColors();
  const { currentStreak, longestStreak, myWeekDone, partnerWeekDone, bothDoneThisWeek } =
    streak;

  const flameColor = bothDoneThisWeek
    ? '#FF6B35'
    : currentStreak > 0
      ? '#FFB347'
      : colors.gray[300];

  return (
    <Card style={style ? [styles.card, style] : styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flame" size={22} color={flameColor} />
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Racha semanal
          </Text>
        </View>
        {longestStreak > 0 && (
          <Text style={[styles.best, { color: colors.text.secondary }]}>
            Récord: {longestStreak} sem.
          </Text>
        )}
      </View>

      <View style={styles.streakRow}>
        <Text style={[styles.streakNumber, { color: flameColor }]}>{currentStreak}</Text>
        <Text style={[styles.streakLabel, { color: colors.text.secondary }]}>
          {currentStreak === 1 ? 'semana' : 'semanas'}
        </Text>
      </View>

      <View style={styles.progressRow}>
        <UserStatus done={myWeekDone} label="Vos" colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.gray[200] }]} />
        <UserStatus done={partnerWeekDone} label="Pareja" colors={colors} />
      </View>

      {!bothDoneThisWeek && (
        <Text style={[styles.hint, { color: colors.text.secondary }]}>
          {myWeekDone
            ? 'Esperando que tu pareja registre una acción esta semana'
            : 'Registrá una acción esta semana para mantener la racha'}
        </Text>
      )}
      {bothDoneThisWeek && (
        <Text style={[styles.hint, { color: colors.success }]}>
          ¡Racha completada esta semana! 🔥
        </Text>
      )}
    </Card>
  );
}

function UserStatus({
  done,
  label,
  colors,
}: {
  done: boolean;
  label: string;
  colors: ReturnType<typeof useThemedColors>;
}) {
  return (
    <View style={styles.userStatus}>
      <View
        style={[
          styles.statusIcon,
          { backgroundColor: done ? `${colors.success}20` : colors.gray[100] },
        ]}
      >
        <Ionicons
          name={done ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={done ? colors.success : colors.gray[300]}
        />
      </View>
      <Text style={[styles.statusLabel, { color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  title: { ...typography.styles.bodyMedium },
  best: { ...typography.styles.small },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  streakNumber: { ...typography.styles.h1, fontSize: 48, lineHeight: 56 },
  streakLabel: { ...typography.styles.body },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  userStatus: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: { ...typography.styles.bodyMedium },
  divider: { width: 1, height: 32 },
  hint: { ...typography.styles.caption, lineHeight: 18 },
});

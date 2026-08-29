import { StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

import { PressableScale } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { borderRadius, shadows, spacing, typography } from '@/theme';

const MIN_HOURS = 0.5;
const MAX_HOURS = 8;

interface DurationFieldProps {
  value: number;
  onChange: (next: number) => void;
}

export function DurationField({ value, onChange }: DurationFieldProps) {
  const { t } = useTranslation('permissions');
  const themeColors = useThemedColors();
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 2;

  const step = (delta: number) =>
    onChange(Math.max(MIN_HOURS, Math.min(MAX_HOURS, safeValue + delta)));

  return (
    <View style={styles.section}>
      <View style={styles.durationHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
          {t('request.durationLabel')}
        </Text>
        <Text style={[styles.durationValue, { color: themeColors.primary }]}>
          {t('request.durationHours', { count: isNaN(value) ? 0 : value })}
        </Text>
      </View>

      <View style={styles.durationControl}>
        <PressableScale
          style={[styles.durationButton, { backgroundColor: themeColors.gray[100] }]}
          onPress={() => step(-0.5)}
          accessibilityRole="button"
          accessibilityLabel={t('request.decreaseDuration')}
        >
          <Ionicons name="remove" size={24} color={themeColors.primary} />
        </PressableScale>

        <View style={[styles.durationTrack, { backgroundColor: themeColors.gray[200] }]}>
          <View
            style={[
              styles.durationFill,
              {
                backgroundColor: themeColors.accent,
                width: `${(safeValue / MAX_HOURS) * 100}%`,
              },
            ]}
          />
        </View>

        <PressableScale
          style={[styles.durationButton, { backgroundColor: themeColors.gray[100] }]}
          onPress={() => step(0.5)}
          accessibilityRole="button"
          accessibilityLabel={t('request.increaseDuration')}
        >
          <Ionicons name="add" size={24} color={themeColors.primary} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.styles.h4, marginBottom: spacing.md },
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  durationValue: { ...typography.styles.h4 },
  durationControl: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  durationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  durationTrack: {
    flex: 1,
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  durationFill: { height: '100%', borderRadius: borderRadius.full },
});

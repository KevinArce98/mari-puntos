import { useState } from 'react';

import { Platform, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

import { Button, PressableScale } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { useColorScheme } from '@/hooks/useColorScheme';
import i18n from '@/i18n';
import { borderRadius, shadows, spacing, typography } from '@/theme';

interface DateTimeFieldProps {
  date: Date;
  time: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
}

export function DateTimeField({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimeFieldProps) {
  const { t } = useTranslation('permissions');
  const themeColors = useThemedColors();
  const colorScheme: 'light' | 'dark' = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);

  const handleDateChange = (_event: unknown, next?: Date) => {
    if (Platform.OS === 'android') setShowPicker(null);
    if (next) onDateChange(next);
  };

  const handleTimeChange = (_event: unknown, next?: Date) => {
    if (Platform.OS === 'android') setShowPicker(null);
    if (next) onTimeChange(next);
  };

  const formatDate = (value: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (value.toDateString() === today.toDateString()) return t('dates.today');
    if (value.toDateString() === tomorrow.toDateString()) return t('dates.tomorrow');
    return value.toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (value: Date) =>
    value.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
        {t('request.whenLabel')}
      </Text>
      <View style={styles.dateTimeRow}>
        <PressableScale
          style={[styles.dateTimeButton, { backgroundColor: themeColors.gray[100] }]}
          onPress={() => setShowPicker((show) => (show === 'date' ? null : 'date'))}
        >
          <Ionicons name="calendar-outline" size={20} color={themeColors.primary} />
          <Text style={[styles.dateTimeText, { color: themeColors.text.primary }]}>
            {formatDate(date)}
          </Text>
        </PressableScale>
        <PressableScale
          style={[styles.dateTimeButton, { backgroundColor: themeColors.gray[100] }]}
          onPress={() => setShowPicker((show) => (show === 'time' ? null : 'time'))}
        >
          <Ionicons name="time-outline" size={20} color={themeColors.primary} />
          <Text style={[styles.dateTimeText, { color: themeColors.text.primary }]}>
            {formatTime(time)}
          </Text>
        </PressableScale>
      </View>

      {showPicker && (
        <View style={styles.calendarContainer}>
          <DateTimePicker
            value={showPicker === 'time' ? time : date}
            mode={showPicker}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={showPicker === 'time' ? handleTimeChange : handleDateChange}
            minimumDate={showPicker === 'date' ? new Date() : undefined}
            locale={i18n.language === 'en' ? 'en-US' : 'es-CR'}
            textColor={themeColors.text.primary}
            themeVariant={colorScheme}
          />
        </View>
      )}

      {Platform.OS === 'ios' && showPicker && (
        <Button
          title={t('request.confirm')}
          onPress={() => setShowPicker(null)}
          variant="secondary"
          style={{ marginTop: spacing.md }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.styles.h4, marginBottom: spacing.md },
  dateTimeRow: { flexDirection: 'row', gap: spacing.sm },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  dateTimeText: { ...typography.styles.bodyMedium },
  calendarContainer: { alignItems: 'center' },
});

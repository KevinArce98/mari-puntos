import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Card, Input } from '@/components/ui';
import { usePermissions } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';
import { PermissionType } from '@/types';

const QUICK_ACTIVITIES = [
  { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline' },
  { id: 'friends', label: 'Friends', icon: 'people-outline' },
  { id: 'sports', label: 'Sports', icon: 'football-outline' },
];

const ACTIVITY_TYPES = [
  { id: 'gaming', label: 'Gaming Session', cost: 10 },
  { id: 'friends', label: 'Night Out with Friends', cost: 15 },
  { id: 'sports', label: 'Sports Activity', cost: 8 },
  { id: 'hobby', label: 'Personal Hobby Time', cost: 5 },
  { id: 'other', label: 'Other', cost: 10 },
];

export default function RequestPermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestPermission } = usePermissions();

  const [selectedQuick, setSelectedQuick] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<string | null>(null);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [duration, setDuration] = useState(2); // hours
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Date & Time pickers state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);

  const selectedActivity = ACTIVITY_TYPES.find((a) => a.id === activityType);
  const estimatedCost = selectedActivity ? selectedActivity.cost * duration : 0;

  const handleQuickSelect = (id: string) => {
    setSelectedQuick(id);
    setActivityType(id);
  };

  const handleRequest = async () => {
    if (!activityType) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select an activity type',
      });
      return;
    }

    setLoading(true);
    try {
      const activity = ACTIVITY_TYPES.find((a) => a.id === activityType);
      const requestedDateTime = getCombinedDateTime();

      await requestPermission({
        title: activity?.label || 'Activity Request',
        // type: activityType as any, // Maps to PermissionType enum
        type: PermissionType.GAMING_SESSION,
        requestedDate: requestedDateTime.toISOString(),
        durationHours: duration,
        pointsCost: estimatedCost,
        description: note.trim() || undefined,
      });

      Toast.show({
        type: 'success',
        text1: '¡Solicitud Enviada!',
        text2: 'Tu pareja recibirá una notificación',
      });

      router.back();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (e as any)?.error ? (e as any).error : 'No se pudo enviar la solicitud',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (change: number) => {
    const newDuration = Math.max(0.5, Math.min(8, duration + change));
    setDuration(newDuration);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
    if (time) {
      setSelectedTime(time);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCombinedDateTime = () => {
    const combined = new Date(selectedDate);
    combined.setHours(selectedTime.getHours());
    combined.setMinutes(selectedTime.getMinutes());
    return combined;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Permiso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick Select */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selección Rápida</Text>
          <View style={styles.quickSelectRow}>
            {QUICK_ACTIVITIES.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.quickSelectItem,
                  selectedQuick === activity.id && styles.quickSelectItemSelected,
                ]}
                onPress={() => handleQuickSelect(activity.id)}
              >
                <Ionicons
                  name={activity.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={
                    selectedQuick === activity.id ? colors.white : colors.text.primary
                  }
                />
                <Text
                  style={[
                    styles.quickSelectLabel,
                    selectedQuick === activity.id && styles.quickSelectLabelSelected,
                  ]}
                >
                  {activity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Actividad</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowActivityPicker(!showActivityPicker)}
          >
            <Text
              style={[styles.dropdownText, !activityType && styles.dropdownPlaceholder]}
            >
              {selectedActivity?.label || 'Selecciona una actividad'}
            </Text>
            <Ionicons
              name={showActivityPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.gray[400]}
            />
          </TouchableOpacity>

          {showActivityPicker && (
            <Card style={styles.dropdownMenu} padding="none">
              {ACTIVITY_TYPES.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.dropdownItem,
                    activityType === activity.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setActivityType(activity.id);
                    setShowActivityPicker(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{activity.label}</Text>
                  <Text style={styles.dropdownItemCost}>{activity.cost} pts/hr</Text>
                </TouchableOpacity>
              ))}
            </Card>
          )}
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuándo</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() =>
                setShowPicker((show) => {
                  return show === 'date' ? null : 'date';
                })
              }
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() =>
                setShowPicker((show) => {
                  return show === 'time' ? null : 'time';
                })
              }
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>{formatTime(selectedTime)}</Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <View style={styles.calendarContainer}>
              <DateTimePicker
                value={showPicker === 'time' ? selectedTime : selectedDate}
                mode={showPicker}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={showPicker === 'time' ? handleTimeChange : handleDateChange}
                minimumDate={showPicker === 'date' ? new Date() : undefined}
                locale="es-CR"
              />
            </View>
          )}

          {/* iOS Confirm Button */}
          {Platform.OS === 'ios' && showPicker && (
            <Button
              title="Confirmar"
              onPress={() => {
                setShowPicker(null);
              }}
              variant="secondary"
              style={{ marginTop: spacing.md }}
            />
          )}
        </View>

        {/* Duration Control */}
        <View style={styles.section}>
          <View style={styles.durationHeader}>
            <Text style={styles.sectionTitle}>Duración</Text>
            <Text style={styles.durationValue}>{duration} horas</Text>
          </View>

          <View style={styles.durationControl}>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => handleDurationChange(-0.5)}
            >
              <Ionicons name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.durationTrack}>
              <View
                style={[styles.durationFill, { width: `${(duration / 8) * 100}%` }]}
              />
            </View>

            <TouchableOpacity
              style={styles.durationButton}
              onPress={() => handleDurationChange(0.5)}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Estimated Cost */}
          <View style={styles.costCard}>
            <Text style={styles.costLabel}>Costo Estimado</Text>
            <Text style={styles.costValue}>{estimatedCost} MariPuntos</Text>
          </View>
        </View>

        {/* Optional Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nota (Opcional)</Text>
          <Input
            placeholder="Agrega un mensaje para tu pareja..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            containerStyle={styles.noteInput}
          />
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <Button
          title="Enviar Solicitud"
          onPress={handleRequest}
          loading={loading}
          disabled={!activityType}
          fullWidth
          icon="send"
        />
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  calendarContainer: {
    alignItems: 'center',
  },
  quickSelectRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickSelectItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
  },
  quickSelectItemSelected: {
    backgroundColor: colors.text.primary,
  },
  quickSelectLabel: {
    ...typography.styles.caption,
    color: colors.text.primary,
  },
  quickSelectLabelSelected: {
    color: colors.white,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  dropdownText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  dropdownPlaceholder: {
    color: colors.gray[400],
  },
  dropdownMenu: {
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  dropdownItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  dropdownItemText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  dropdownItemCost: {
    ...typography.styles.caption,
    color: colors.primary,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  dateTimeText: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
  },
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  durationValue: {
    ...typography.styles.h4,
    color: colors.primary,
  },
  durationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  durationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  durationTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  durationFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  costCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.accent}15`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  costLabel: {
    ...typography.styles.bodyMedium,
    color: colors.text.secondary,
  },
  costValue: {
    ...typography.styles.h4,
    color: colors.accent,
  },
  noteInput: {
    marginBottom: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.lg,
    ...shadows.lg,
  },
});

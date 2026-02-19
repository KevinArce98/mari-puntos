import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Card, TextAreaWithCounter } from '@/components/ui';
import { usePermissions, useThemedColors } from '@/hooks';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { createUTC6DateTime } from '@/utils/dateUtils';
import Toast from 'react-native-toast-message';
import { permissionsService } from '@/services';
import { Permission } from '@/types';
import logger from '@/utils/logger';

export default function EditPermissionScreen() {
  const themeColors = useThemedColors();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { updatePermission } = usePermissions();

  const [permission, setPermission] = useState<Permission | null>(null);
  const [loadingPermission, setLoadingPermission] = useState(true);
  const [duration, setDuration] = useState(2);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Date & Time pickers state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);

  useEffect(() => {
    loadPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPermission = async () => {
    if (!id) return;

    try {
      setLoadingPermission(true);
      const data = await permissionsService.getPermissionById(id);
      setPermission(data);

      // Initialize form with existing data
      const requestedDate = new Date(data.requestedDate);
      setSelectedDate(requestedDate);
      setSelectedTime(requestedDate);
      setDuration(Number(data.durationHours) || 2);
      setNote(data.metadata?.note || '');
    } catch (error) {
      logger.error('Failed to load permission for editing', error as Error, {
        permissionId: id,
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar la solicitud',
      });
      router.back();
    } finally {
      setLoadingPermission(false);
    }
  };

  const handleUpdate = async () => {
    if (!id || !permission) return;

    setLoading(true);
    try {
      const requestedDateTime = getCombinedDateTime();

      await updatePermission(id, {
        requestedDate: requestedDateTime.toISOString(),
        durationHours: duration,
        metadata: note.trim() ? { note: note.trim() } : undefined,
      });

      Toast.show({
        type: 'success',
        text1: '¡Solicitud Actualizada!',
        text2: 'Los cambios se han guardado',
      });

      router.back();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (e as any)?.error
          ? (e as any).error
          : 'No se pudo actualizar la solicitud',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (change: number) => {
    const currentDuration = isNaN(duration) ? 2 : duration;
    const newDuration = Math.max(0.5, Math.min(8, currentDuration + change));
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
    return createUTC6DateTime(selectedDate, selectedTime);
  };

  if (loadingPermission) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: themeColors.background, paddingTop: insets.top },
          styles.loadingContainer,
        ]}
      >
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.text.secondary }]}>
          Cargando solicitud...
        </Text>
      </View>
    );
  }

  if (!permission) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.background,
          paddingTop: Platform.OS !== 'ios' ? insets.top : 0,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
          Editar Solicitud
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Activity Info */}
            <Card style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons
                  name={permission.template?.metadata?.icon || 'help-circle'}
                  size={32}
                  color={themeColors.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoTitle, { color: themeColors.text.primary }]}>
                    {permission.template?.title}
                  </Text>
                  {permission.template?.description && (
                    <Text
                      style={[
                        styles.infoDescription,
                        { color: themeColors.text.secondary },
                      ]}
                    >
                      {permission.template.description}
                    </Text>
                  )}
                </View>
              </View>
            </Card>

            {/* Date & Time */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                Cuándo
              </Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    { backgroundColor: themeColors.gray[100] },
                  ]}
                  onPress={() =>
                    setShowPicker((show) => (show === 'date' ? null : 'date'))
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={themeColors.primary}
                  />
                  <Text
                    style={[styles.dateTimeText, { color: themeColors.text.primary }]}
                  >
                    {formatDate(selectedDate)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    { backgroundColor: themeColors.gray[100] },
                  ]}
                  onPress={() =>
                    setShowPicker((show) => (show === 'time' ? null : 'time'))
                  }
                >
                  <Ionicons name="time-outline" size={20} color={themeColors.primary} />
                  <Text
                    style={[styles.dateTimeText, { color: themeColors.text.primary }]}
                  >
                    {formatTime(selectedTime)}
                  </Text>
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
                    textColor={themeColors.text.primary}
                    themeVariant={colorScheme}
                  />
                </View>
              )}

              {Platform.OS === 'ios' && showPicker && (
                <Button
                  title="Confirmar"
                  onPress={() => setShowPicker(null)}
                  variant="secondary"
                  style={{ marginTop: spacing.md }}
                />
              )}
            </View>

            {/* Duration Control */}
            <View style={styles.section}>
              <View style={styles.durationHeader}>
                <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                  Duración
                </Text>
                <Text style={[styles.durationValue, { color: themeColors.primary }]}>
                  {isNaN(duration) ? 0 : duration} horas
                </Text>
              </View>

              <View style={styles.durationControl}>
                <TouchableOpacity
                  style={[
                    styles.durationButton,
                    { backgroundColor: themeColors.gray[100] },
                  ]}
                  onPress={() => handleDurationChange(-0.5)}
                >
                  <Ionicons name="remove" size={24} color={themeColors.primary} />
                </TouchableOpacity>

                <View
                  style={[
                    styles.durationTrack,
                    { backgroundColor: themeColors.gray[200] },
                  ]}
                >
                  <View
                    style={[
                      styles.durationFill,
                      {
                        backgroundColor: themeColors.accent,
                        width: `${(duration / 8) * 100}%`,
                      },
                    ]}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.durationButton,
                    { backgroundColor: themeColors.gray[100] },
                  ]}
                  onPress={() => handleDurationChange(0.5)}
                >
                  <Ionicons name="add" size={24} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Optional Note */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                Nota (Opcional)
              </Text>
              <TextAreaWithCounter
                placeholder="Agrega un mensaje para tu pareja..."
                value={note}
                onChangeText={setNote}
                numberOfLines={3}
                maxLength={500}
                containerStyle={styles.noteInput}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View
        style={[
          styles.bottomContainer,
          {
            backgroundColor: themeColors.background,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <Button
          title="Guardar Cambios"
          onPress={handleUpdate}
          loading={loading}
          fullWidth
          icon="checkmark"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.styles.body,
    marginTop: spacing.md,
  },
  keyboardView: {
    flex: 1,
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
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  infoCard: {
    marginBottom: spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.xs,
  },
  infoDescription: {
    ...typography.styles.body,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.md,
  },
  calendarContainer: {
    alignItems: 'center',
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
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  dateTimeText: {
    ...typography.styles.bodyMedium,
  },
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  durationValue: {
    ...typography.styles.h4,
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
  durationFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  noteInput: {
    marginBottom: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    ...shadows.lg,
  },
});

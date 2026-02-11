import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Card, Input } from '@/components/ui';
import { usePermissions } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import { createUTC6DateTime } from '@/utils/dateUtils';
import Toast from 'react-native-toast-message';
import { PermissionTemplate, PermissionCategory } from '@/types';
import { permissionsService } from '@/services';

const QUICK_ACTIVITIES = [
  { id: PermissionCategory.GAMING, label: 'Gaming', icon: 'game-controller-outline' },
  { id: PermissionCategory.SOCIAL, label: 'Friends', icon: 'people-outline' },
  { id: PermissionCategory.SPORTS, label: 'Sports', icon: 'football-outline' },
];

export default function RequestPermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestPermission } = usePermissions();

  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedQuick, setSelectedQuick] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(
    null
  );
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [duration, setDuration] = useState(2); // hours
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Date & Time pickers state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);

  const estimatedCost = selectedTemplate
    ? (selectedTemplate.suggestedPointsCost || 0) *
      (duration / (selectedTemplate.suggestedDurationHours || 1))
    : 0;

  // Load permission templates
  useEffect(() => {
    loadTemplates();
  }, []);

  // Reload templates when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [])
  );

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const result = await permissionsService.getTemplates();
      console.log('Templates loaded:', result);
      setTemplates(result.data || []);
      if (!result.data || result.data.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No hay actividades',
          text2: 'Contacta al administrador para agregar plantillas',
        });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar las plantillas',
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleQuickSelect = (category: string) => {
    setSelectedQuick(category);
    // Find first template of this category
    const template = templates.find((t) => t.category === category);
    if (template) {
      setSelectedTemplate(template);
      if (template.suggestedDurationHours) {
        setDuration(template.suggestedDurationHours);
      }
    }
  };

  const handleRequest = async () => {
    if (!selectedTemplate) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Por favor selecciona un tipo de permiso',
      });
      return;
    }

    setLoading(true);
    try {
      const requestedDateTime = getCombinedDateTime();

      await requestPermission({
        templateId: selectedTemplate.id,
        requestedDate: requestedDateTime.toISOString(),
        durationHours: duration,
        pointsCost: Math.round(estimatedCost),
        metadata: note.trim() ? { note: note.trim() } : undefined,
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
    return createUTC6DateTime(selectedDate, selectedTime);
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
            {loadingTemplates ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Cargando plantillas...</Text>
              </View>
            ) : (
              <>
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
                            selectedQuick === activity.id
                              ? colors.white
                              : colors.text.primary
                          }
                        />
                        <Text
                          style={[
                            styles.quickSelectLabel,
                            selectedQuick === activity.id &&
                              styles.quickSelectLabelSelected,
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
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Tipo de Actividad</Text>
                    <TouchableOpacity
                      onPress={() => {
                        router.push('/permissions/create-template');
                      }}
                      style={styles.addButton}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={styles.addButtonText}>Nueva</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowTemplatePicker(!showTemplatePicker)}
                  >
                    {selectedTemplate?.metadata?.icon && (
                      <View style={styles.dropdownIcon}>
                        <Ionicons
                          name={
                            selectedTemplate.metadata
                              .icon as keyof typeof Ionicons.glyphMap
                          }
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.dropdownText,
                        !selectedTemplate && styles.dropdownPlaceholder,
                      ]}
                    >
                      {selectedTemplate?.title || 'Selecciona una actividad'}
                    </Text>
                    <Ionicons
                      name={showTemplatePicker ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.gray[400]}
                    />
                  </TouchableOpacity>

                  {showTemplatePicker && (
                    <Card style={styles.dropdownMenu} padding="none">
                      {templates.length === 0 ? (
                        <View style={styles.emptyTemplates}>
                          <Ionicons
                            name="information-circle-outline"
                            size={48}
                            color={colors.gray[400]}
                          />
                          <Text style={styles.emptyTemplatesText}>
                            No hay actividades disponibles
                          </Text>
                          <Text style={styles.emptyTemplatesSubtext}>
                            Las plantillas de actividades se cargan automáticamente
                          </Text>
                        </View>
                      ) : (
                        templates.map((template) => (
                          <TouchableOpacity
                            key={template.id}
                            style={[
                              styles.dropdownItem,
                              selectedTemplate?.id === template.id &&
                                styles.dropdownItemSelected,
                            ]}
                            onPress={() => {
                              setSelectedTemplate(template);
                              setSelectedQuick(template.category);
                              if (template.suggestedDurationHours) {
                                setDuration(template.suggestedDurationHours);
                              }
                              setShowTemplatePicker(false);
                            }}
                          >
                            {template.metadata?.icon && (
                              <View style={styles.dropdownItemIcon}>
                                <Ionicons
                                  name={
                                    template.metadata
                                      .icon as keyof typeof Ionicons.glyphMap
                                  }
                                  size={24}
                                  color={colors.primary}
                                />
                              </View>
                            )}
                            <View style={styles.dropdownItemContent}>
                              <Text style={styles.dropdownItemText}>
                                {template.title}
                              </Text>
                              {template.description && (
                                <Text style={styles.dropdownItemDescription}>
                                  {template.description}
                                </Text>
                              )}
                            </View>
                            {template.suggestedPointsCost && (
                              <Text style={styles.dropdownItemCost}>
                                {template.suggestedPointsCost} pts
                                {template.suggestedDurationHours &&
                                  `/${template.suggestedDurationHours}h`}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))
                      )}
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
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={colors.primary}
                      />
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
                        onChange={
                          showPicker === 'time' ? handleTimeChange : handleDateChange
                        }
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
                        style={[
                          styles.durationFill,
                          { width: `${(duration / 8) * 100}%` },
                        ]}
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
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Bottom Button */}
      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <Button
          title="Enviar Solicitud"
          onPress={handleRequest}
          loading={loading}
          disabled={!selectedTemplate || loadingTemplates}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
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
  dropdownIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  dropdownText: {
    ...typography.styles.body,
    color: colors.text.primary,
    flex: 1,
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
  dropdownItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  dropdownItemContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  dropdownItemText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  dropdownItemDescription: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  dropdownItemCost: {
    ...typography.styles.caption,
    color: colors.primary,
  },
  emptyTemplates: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTemplatesText: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptyTemplatesSubtext: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
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

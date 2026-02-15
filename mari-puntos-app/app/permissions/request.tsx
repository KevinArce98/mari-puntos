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
import { PermissionTemplate } from '@/types';
import { permissionsService } from '@/services';
import logger from '@/utils/logger';

export default function RequestPermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestPermission } = usePermissions();

  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(
    null
  );
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [duration, setDuration] = useState(2); // hours
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [customCost, setCustomCost] = useState<number | null>(null);
  const [isEditingCost, setIsEditingCost] = useState(false);

  // Date & Time pickers state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);

  const estimatedCost = selectedTemplate
    ? selectedTemplate.suggestedPointsCost != null &&
      selectedTemplate.suggestedDurationHours != null &&
      selectedTemplate.suggestedDurationHours > 0 &&
      typeof duration === 'number' &&
      !isNaN(duration) &&
      duration > 0
      ? Math.round(
          (selectedTemplate.suggestedPointsCost /
            selectedTemplate.suggestedDurationHours) *
            duration
        )
      : 0
    : 0;

  const finalCost = customCost !== null ? customCost : estimatedCost;

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
      setTemplates(result.data || []);
      logger.debug('Permission templates loaded', { count: result.data?.length || 0 });
      if (!result.data || result.data.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No hay actividades',
          text2: 'Contacta al administrador para agregar plantillas',
        });
      }
    } catch (error) {
      logger.error('Failed to load permission templates', error as Error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar las plantillas',
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Combine and sort all templates alphabetically
  const allTemplatesSorted = [...templates].sort((a, b) =>
    a.title.localeCompare(b.title, 'es')
  );

  const handleTemplateSelect = (template: PermissionTemplate) => {
    setSelectedTemplate(template);
    const suggestedDuration = template.suggestedDurationHours;
    setDuration(
      typeof suggestedDuration === 'number' && suggestedDuration > 0
        ? suggestedDuration
        : 2
    );
    setCustomCost(null);
    setIsEditingCost(false);
  };

  const handleRequest = async () => {
    if (!selectedTemplate) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Por favor selecciona un tipo de actividad',
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
        pointsCost: Math.round(finalCost),
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
    const currentDuration =
      typeof duration === 'number' && !isNaN(duration) ? duration : 2;
    const newDuration = Math.max(0.5, Math.min(8, currentDuration + change));
    setDuration(newDuration);
    // Reset custom cost when duration changes
    if (customCost !== null) {
      setCustomCost(null);
      setIsEditingCost(false);
    }
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
    <View
      style={[styles.container, { paddingTop: Platform.OS !== 'ios' ? insets.top : 0 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Solicitud</Text>
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
                {/* Activity Type */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <TouchableOpacity
                      onPress={() => router.push('/permissions/create-template')}
                      style={styles.addButton}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={styles.addButtonText}>Nueva Actividad</Text>
                    </TouchableOpacity>
                  </View>

                  {/* All Templates Dropdown */}
                  <View style={styles.allTemplatesSection}>
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
                        {selectedTemplate
                          ? selectedTemplate.title
                          : 'Selecciona una actividad'}
                      </Text>
                      <Ionicons
                        name={showTemplatePicker ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.gray[400]}
                      />
                    </TouchableOpacity>

                    {showTemplatePicker && (
                      <Card style={styles.dropdownMenu} padding="none">
                        {allTemplatesSorted.length === 0 ? (
                          <View style={styles.emptyTemplates}>
                            <Ionicons
                              name="information-circle-outline"
                              size={48}
                              color={colors.gray[400]}
                            />
                            <Text style={styles.emptyTemplatesText}>
                              No hay actividades disponibles
                            </Text>
                          </View>
                        ) : (
                          allTemplatesSorted.map((template) => (
                            <TouchableOpacity
                              key={template.id}
                              style={[
                                styles.dropdownItem,
                                selectedTemplate?.id === template.id &&
                                  styles.dropdownItemSelected,
                              ]}
                              onPress={() => handleTemplateSelect(template)}
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
                                <View style={styles.dropdownItemTitleRow}>
                                  <Text style={styles.dropdownItemText}>
                                    {template.title}
                                  </Text>
                                  {!template.isSystemTemplate && (
                                    <Ionicons
                                      name="star"
                                      size={16}
                                      color={colors.accent}
                                      style={styles.customBadge}
                                    />
                                  )}
                                </View>
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
                        textColor={colors.text.primary}
                        themeVariant="light"
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
                    <Text style={styles.durationValue}>
                      {isNaN(duration) ? 0 : duration} horas
                    </Text>
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
                    <View style={styles.costHeader}>
                      <Text style={styles.costLabel}>
                        {customCost !== null ? 'Costo Personalizado' : 'Costo Estimado'}
                      </Text>
                      {!isEditingCost && (
                        <TouchableOpacity onPress={() => setIsEditingCost(true)}>
                          <Ionicons
                            name="create-outline"
                            size={20}
                            color={colors.accent}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    {isEditingCost ? (
                      <View style={styles.costEditContainer}>
                        <Input
                          value={
                            customCost !== null
                              ? customCost.toString()
                              : estimatedCost.toString()
                          }
                          onChangeText={(text) => {
                            const value = parseInt(text);
                            setCustomCost(isNaN(value) ? 0 : value);
                          }}
                          keyboardType="numeric"
                          placeholder="Puntos"
                          containerStyle={styles.costInput}
                        />
                        <View style={styles.costEditActions}>
                          <Button
                            title="Cancelar"
                            onPress={() => {
                              setCustomCost(null);
                              setIsEditingCost(false);
                            }}
                            variant="outline"
                            size="sm"
                            style={{ flex: 1 }}
                          />
                          <Button
                            title="Aplicar"
                            onPress={() => setIsEditingCost(false)}
                            size="sm"
                            style={{ flex: 1 }}
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.costValueContainer}>
                        <Text style={styles.costValue}>
                          {isNaN(finalCost) ? 0 : Math.round(finalCost)} MariPuntos
                        </Text>
                        {customCost === null &&
                          selectedTemplate?.suggestedDurationHours && (
                            <Text style={styles.costPerHour}>
                              ({Math.round(estimatedCost / duration)} pts/hora)
                            </Text>
                          )}
                      </View>
                    )}
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
  subsectionTitle: {
    ...typography.styles.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  allTemplatesSection: {
    // No extra styling needed, uses existing dropdown styles
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
  dropdownItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  customBadge: {
    marginLeft: spacing.xs / 2,
  },
  calendarContainer: {
    alignItems: 'center',
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
    flexDirection: 'column',
    backgroundColor: `${colors.accent}15`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  costHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  costLabel: {
    ...typography.styles.bodyMedium,
    color: colors.text.secondary,
  },
  costValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  costValue: {
    ...typography.styles.h4,
    color: colors.accent,
  },
  costPerHour: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  costEditContainer: {
    gap: spacing.sm,
  },
  costInput: {
    marginBottom: 0,
  },
  costEditActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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

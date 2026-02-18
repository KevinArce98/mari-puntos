import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { usePermissions, useThemedColors } from '@/hooks';
import { useColorScheme } from 'react-native';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { createUTC6DateTime } from '@/utils/dateUtils';
import Toast from 'react-native-toast-message';
import { PermissionTemplate } from '@/types';
import { permissionsService } from '@/services';
import logger from '@/utils/logger';

export default function RequestPermissionScreen() {
  const themeColors = useThemedColors();
  const colorScheme = useColorScheme() ?? 'light';
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

  // Date & Time pickers state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);

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
    setShowTemplatePicker(false);
    const suggestedDuration = template.suggestedDurationHours;
    setDuration(
      typeof suggestedDuration === 'number' && suggestedDuration > 0
        ? suggestedDuration
        : 2
    );
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
          Nueva Solicitud
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
            {loadingTemplates ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text style={[styles.loadingText, { color: themeColors.text.secondary }]}>
                  Cargando plantillas...
                </Text>
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
                        color={themeColors.primary}
                      />
                      <Text
                        style={[styles.addButtonText, { color: themeColors.primary }]}
                      >
                        Nueva Actividad
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* All Templates Dropdown */}
                  <View style={styles.allTemplatesSection}>
                    {showTemplatePicker && (
                      <Pressable
                        style={styles.dropdownBackdrop}
                        onPress={() => setShowTemplatePicker(false)}
                      />
                    )}
                    <TouchableOpacity
                      style={[styles.dropdown, { backgroundColor: themeColors.gray[100] }]}  
                      onPress={() => setShowTemplatePicker(!showTemplatePicker)}
                    >
                      {selectedTemplate?.metadata?.icon && (
                        <View
                          style={[
                            styles.dropdownIcon,
                            { backgroundColor: `${themeColors.primary}15` },
                          ]}
                        >
                          <Ionicons
                            name={
                              selectedTemplate.metadata
                                .icon as keyof typeof Ionicons.glyphMap
                            }
                            size={20}
                            color={themeColors.primary}
                          />
                        </View>
                      )}
                      <Text
                        style={[
                          styles.dropdownText,
                          { color: themeColors.text.primary },
                          !selectedTemplate && { color: themeColors.gray[400] },
                        ]}
                      >
                        {selectedTemplate
                          ? selectedTemplate.title
                          : 'Selecciona una actividad'}
                      </Text>
                      <Ionicons
                        name={showTemplatePicker ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={themeColors.gray[400]}
                      />
                    </TouchableOpacity>

                    {showTemplatePicker && (
                      <Card style={styles.dropdownMenu} padding="none">
                        {allTemplatesSorted.length === 0 ? (
                          <View style={styles.emptyTemplates}>
                            <Ionicons
                              name="information-circle-outline"
                              size={48}
                              color={themeColors.gray[400]}
                            />
                            <Text
                              style={[
                                styles.emptyTemplatesText,
                                { color: themeColors.text.primary },
                              ]}
                            >
                              No hay actividades disponibles
                            </Text>
                          </View>
                        ) : (
                          allTemplatesSorted.map((template) => (
                            <TouchableOpacity
                              key={template.id}
                              style={[
                                styles.dropdownItem,
                                { borderBottomColor: themeColors.gray[100] },
                                selectedTemplate?.id === template.id && {
                                  backgroundColor: `${themeColors.primary}10`,
                                },
                              ]}
                              onPress={() => handleTemplateSelect(template)}
                            >
                              {template.metadata?.icon && (
                                <View
                                  style={[
                                    styles.dropdownItemIcon,
                                    { backgroundColor: `${themeColors.primary}15` },
                                  ]}
                                >
                                  <Ionicons
                                    name={
                                      template.metadata
                                        .icon as keyof typeof Ionicons.glyphMap
                                    }
                                    size={24}
                                    color={themeColors.primary}
                                  />
                                </View>
                              )}
                              <View style={styles.dropdownItemContent}>
                                <View style={styles.dropdownItemTitleRow}>
                                  <Text
                                    style={[
                                      styles.dropdownItemText,
                                      { color: themeColors.text.primary },
                                    ]}
                                  >
                                    {template.title}
                                  </Text>
                                  {!template.isSystemTemplate && (
                                    <Ionicons
                                      name="star"
                                      size={16}
                                      color={themeColors.accent}
                                      style={styles.customBadge}
                                    />
                                  )}
                                </View>
                                {template.description && (
                                  <Text
                                    style={[
                                      styles.dropdownItemDescription,
                                      { color: themeColors.text.secondary },
                                    ]}
                                  >
                                    {template.description}
                                  </Text>
                                )}
                              </View>
                              {template.suggestedPointsCost && (
                                <Text
                                  style={[
                                    styles.dropdownItemCost,
                                    { color: themeColors.primary },
                                  ]}
                                >
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
                  <Text
                    style={[styles.sectionTitle, { color: themeColors.text.primary }]}
                  >
                    Cuándo
                  </Text>
                  <View style={styles.dateTimeRow}>
                    <TouchableOpacity
                      style={[
                        styles.dateTimeButton,
                        { backgroundColor: themeColors.gray[100] },
                      ]}
                      onPress={() =>
                        setShowPicker((show) => {
                          return show === 'date' ? null : 'date';
                        })
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
                        setShowPicker((show) => {
                          return show === 'time' ? null : 'time';
                        })
                      }
                    >
                      <Ionicons
                        name="time-outline"
                        size={20}
                        color={themeColors.primary}
                      />
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
                        onChange={
                          showPicker === 'time' ? handleTimeChange : handleDateChange
                        }
                        minimumDate={showPicker === 'date' ? new Date() : undefined}
                        locale="es-CR"
                        textColor={themeColors.text.primary}
                        themeVariant={colorScheme}
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
                    <Text
                      style={[styles.sectionTitle, { color: themeColors.text.primary }]}
                    >
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
                          { backgroundColor: themeColors.accent },
                          { width: `${(duration / 8) * 100}%` },
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
                  <Text
                    style={[styles.sectionTitle, { color: themeColors.text.primary }]}
                  >
                    Nota (Opcional)
                  </Text>
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
        style={[
          styles.bottomContainer,
          {
            backgroundColor: themeColors.background,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.styles.h4,
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
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  allTemplatesSection: {
    zIndex: 10,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    right: -9999,
    bottom: -9999,
    zIndex: 9,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.styles.bodyMedium,
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
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    zIndex: 10,
    ...shadows.sm,
  },
  dropdownIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  dropdownText: {
    ...typography.styles.body,
    flex: 1,
  },
  dropdownPlaceholder: {},
  dropdownMenu: {
    marginTop: spacing.sm,
    overflow: 'hidden',
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  dropdownItemSelected: {},
  dropdownItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
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
  },
  dropdownItemDescription: {
    ...typography.styles.caption,
    marginTop: spacing.xs,
  },
  dropdownItemCost: {
    ...typography.styles.caption,
  },
  emptyTemplates: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTemplatesText: {
    ...typography.styles.bodyMedium,
    textAlign: 'center',
  },
  emptyTemplatesSubtext: {
    ...typography.styles.caption,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.styles.body,
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

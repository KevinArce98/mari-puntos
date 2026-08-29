import React, { useCallback, useState } from 'react';

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';

import { Ionicons } from '@expo/vector-icons';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  Button,
  Card,
  PressableScale,
  SkeletonList,
  TextAreaWithCounter,
} from '@/components/ui';
import { usePermissions, useThemedColors } from '@/hooks';
import { useColorScheme } from '@/hooks/useColorScheme';
import i18n from '@/i18n';
import { permissionsService } from '@/services';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { Permission } from '@/types';
import { createUTC6DateTime } from '@/utils/dateUtils';
import { getApiErrorMessage } from '@/utils/errorMessage';
import logger from '@/utils/logger';

export default function EditPermissionScreen() {
  const { t } = useTranslation(['permissions', 'common', 'errors']);
  const themeColors = useThemedColors();
  const colorScheme: 'light' | 'dark' = useColorScheme() === 'dark' ? 'dark' : 'light';
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { updatePermission } = usePermissions();

  const [permission, setPermission] = useState<Permission | null>(null);
  const [loadingPermission, setLoadingPermission] = useState(true);
  const [duration, setDuration] = useState(2);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [allowExit, setAllowExit] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);

  usePreventRemove(hasEdited && !allowExit, ({ data }) => {
    Alert.alert(t('edit.discard.title'), t('edit.discard.message'), [
      { text: t('common:actions.keepEditing'), style: 'cancel' },
      {
        text: t('edit.discard.confirm'),
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  const loadPermission = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingPermission(true);
      const data = await permissionsService.getPermissionById(id);
      setPermission(data);

      const requestedDate = new Date(data.requestedDate);
      setSelectedDate(requestedDate);
      setSelectedTime(requestedDate);
      setDuration(Number(data.durationHours) || 2);
      setNote(data.metadata?.note || '');
      setHasEdited(false);
    } catch (error) {
      logger.error('Failed to load permission for editing', error as Error, {
        permissionId: id,
      });
      toast.error(t('errors:title'), { description: t('edit.loadError') });
      router.back();
    } finally {
      setLoadingPermission(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadPermission();
    }, [loadPermission])
  );

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

      logger.info('Permission updated', { permissionId: id, durationHours: duration });

      toast.success(t('edit.updatedTitle'), {
        description: t('edit.updatedMessage'),
      });

      setAllowExit(true);
      setTimeout(() => router.back(), 0);
    } catch (e) {
      toast.error(t('errors:title'), {
        description: getApiErrorMessage(e) ?? t('edit.updateError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (change: number) => {
    const currentDuration = isNaN(duration) ? 2 : duration;
    const newDuration = Math.max(0.5, Math.min(8, currentDuration + change));
    setDuration(newDuration);
    setHasEdited(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
    if (date) {
      setSelectedDate(date);
      setHasEdited(true);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
    if (time) {
      setSelectedTime(time);
      setHasEdited(true);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return t('dates.today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('dates.tomorrow');
    } else {
      return date.toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString(i18n.language, {
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
        ]}
      >
        <SkeletonList
          count={3}
          lines={3}
          showAvatar={false}
          style={{ padding: spacing.lg }}
        />
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
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('edit.backA11y')}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
        </PressableScale>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
          {t('edit.headerTitle')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                {t('edit.whenLabel')}
              </Text>
              <View style={styles.dateTimeRow}>
                <PressableScale
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
                </PressableScale>
                <PressableScale
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
                </PressableScale>
              </View>

              {showPicker && (
                <View style={styles.calendarContainer}>
                  <DateTimePicker
                    value={showPicker === 'time' ? selectedTime : selectedDate}
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
                  title={t('edit.confirm')}
                  onPress={() => setShowPicker(null)}
                  variant="secondary"
                  style={{ marginTop: spacing.md }}
                />
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.durationHeader}>
                <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                  {t('edit.durationLabel')}
                </Text>
                <Text style={[styles.durationValue, { color: themeColors.primary }]}>
                  {t('edit.durationHours', { count: isNaN(duration) ? 0 : duration })}
                </Text>
              </View>

              <View style={styles.durationControl}>
                <PressableScale
                  style={[
                    styles.durationButton,
                    { backgroundColor: themeColors.gray[100] },
                  ]}
                  onPress={() => handleDurationChange(-0.5)}
                  accessibilityRole="button"
                  accessibilityLabel={t('edit.decreaseDuration')}
                >
                  <Ionicons name="remove" size={24} color={themeColors.primary} />
                </PressableScale>

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

                <PressableScale
                  style={[
                    styles.durationButton,
                    { backgroundColor: themeColors.gray[100] },
                  ]}
                  onPress={() => handleDurationChange(0.5)}
                  accessibilityRole="button"
                  accessibilityLabel={t('edit.increaseDuration')}
                >
                  <Ionicons name="add" size={24} color={themeColors.primary} />
                </PressableScale>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                {t('edit.noteLabel')}
              </Text>
              <TextAreaWithCounter
                placeholder={t('edit.messagePlaceholder')}
                value={note}
                onChangeText={(value) => {
                  setNote(value);
                  setHasEdited(true);
                }}
                numberOfLines={3}
                maxLength={500}
                containerStyle={styles.noteInput}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

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
          title={t('edit.submit')}
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

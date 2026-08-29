import { useCallback, useState } from 'react';

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { DateTimeField, DurationField } from '@/components/permissions';
import {
  Button,
  Card,
  PressableScale,
  SkeletonList,
  TextAreaWithCounter,
} from '@/components/ui';
import { useDiscardConfirm, usePermissions, useThemedColors } from '@/hooks';
import { permissionsService } from '@/services';
import { shadows, spacing, typography } from '@/theme';
import { Permission } from '@/types';
import { createUTC6DateTime } from '@/utils/dateUtils';
import { getApiErrorMessage } from '@/utils/errorMessage';
import logger from '@/utils/logger';

export default function EditPermissionScreen() {
  const { t } = useTranslation(['permissions', 'common', 'errors']);
  const themeColors = useThemedColors();
  const router = useRouter();
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

  useDiscardConfirm({
    enabled: hasEdited && !allowExit,
    title: t('edit.discard.title'),
    message: t('edit.discard.message'),
    confirmLabel: t('edit.discard.confirm'),
    cancelLabel: t('common:actions.keepEditing'),
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
      const requestedDateTime = createUTC6DateTime(selectedDate, selectedTime);

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

            <DateTimeField
              date={selectedDate}
              time={selectedTime}
              onDateChange={(date) => {
                setSelectedDate(date);
                setHasEdited(true);
              }}
              onTimeChange={(time) => {
                setSelectedTime(time);
                setHasEdited(true);
              }}
            />

            <DurationField
              value={duration}
              onChange={(next) => {
                setDuration(next);
                setHasEdited(true);
              }}
            />

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

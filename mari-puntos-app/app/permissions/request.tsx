import { useEffect, useState } from 'react';

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

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { DateTimeField, DurationField, TemplatePicker } from '@/components/permissions';
import {
  Button,
  PressableScale,
  SkeletonList,
  TextAreaWithCounter,
} from '@/components/ui';
import {
  useDiscardConfirm,
  useKeyboardOffset,
  usePermissions,
  useTemplates,
  useThemedColors,
} from '@/hooks';
import { shadows, spacing, typography } from '@/theme';
import { PermissionTemplate } from '@/types';
import { createUTC6DateTime } from '@/utils/dateUtils';
import { getApiErrorMessage } from '@/utils/errorMessage';
import logger from '@/utils/logger';
import { RequestPermissionFormData, requestPermissionSchema } from '@/validators';

export default function RequestPermissionScreen() {
  const { t } = useTranslation(['permissions', 'common', 'errors']);
  const themeColors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestPermission } = usePermissions();
  const keyboardOffset = useKeyboardOffset();
  const {
    templates,
    isLoading: loadingTemplates,
    error: templatesError,
  } = useTemplates();

  const [allowExit, setAllowExit] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<RequestPermissionFormData>({
    mode: 'onChange',
    resolver: zodResolver(requestPermissionSchema),
    defaultValues: {
      templateId: '',
      requestedDate: new Date(),
      requestedTime: new Date(),
      durationHours: 2,
      note: '',
    },
  });

  const templateId = useWatch({ control, name: 'templateId' });
  const requestedDate = useWatch({ control, name: 'requestedDate' });
  const requestedTime = useWatch({ control, name: 'requestedTime' });
  const durationHours = useWatch({ control, name: 'durationHours' });

  const selectedTemplate = templates.find((item) => item.id === templateId) ?? null;

  useDiscardConfirm({
    enabled: isDirty && !allowExit,
    title: t('request.discard.title'),
    message: t('request.discard.message'),
    confirmLabel: t('request.discard.confirm'),
    cancelLabel: t('common:actions.keepEditing'),
  });

  useEffect(() => {
    if (loadingTemplates) return;
    if (templatesError) {
      toast.error(t('errors:title'), { description: t('request.loadTemplatesError') });
    }
  }, [loadingTemplates, templatesError, t]);

  const handleTemplateSelect = (template: PermissionTemplate) => {
    setValue('templateId', template.id, { shouldDirty: true, shouldValidate: true });
    const suggestedDuration = template.suggestedDurationHours;
    setValue(
      'durationHours',
      typeof suggestedDuration === 'number' && suggestedDuration > 0
        ? suggestedDuration
        : 2,
      { shouldDirty: true }
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const requestedDateTime = createUTC6DateTime(
        data.requestedDate,
        data.requestedTime
      );

      await requestPermission({
        templateId: data.templateId,
        requestedDate: requestedDateTime.toISOString(),
        durationHours: data.durationHours,
        metadata: data.note?.trim() ? { note: data.note.trim() } : undefined,
      });

      logger.info('Permission request submitted', {
        templateId: data.templateId,
        durationHours: data.durationHours,
      });

      toast.success(t('request.sentTitle'), { description: t('request.sentMessage') });

      setAllowExit(true);
      setTimeout(() => router.back(), 0);
    } catch (e) {
      toast.error(t('errors:title'), {
        description: getApiErrorMessage(e) ?? t('request.sendError'),
      });
    }
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('request.backA11y')}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
        </PressableScale>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
          {t('request.headerTitle')}
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
            {loadingTemplates ? (
              <SkeletonList count={4} lines={2} showAvatar={false} />
            ) : (
              <>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <PressableScale
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
                        {t('request.newActivity')}
                      </Text>
                    </PressableScale>
                  </View>

                  <TemplatePicker
                    templates={templates}
                    selectedTemplate={selectedTemplate}
                    onSelect={handleTemplateSelect}
                  />
                </View>

                <DateTimeField
                  date={requestedDate}
                  time={requestedTime}
                  onDateChange={(date) =>
                    setValue('requestedDate', date, { shouldDirty: true })
                  }
                  onTimeChange={(time) =>
                    setValue('requestedTime', time, { shouldDirty: true })
                  }
                />

                <DurationField
                  value={durationHours}
                  onChange={(next) =>
                    setValue('durationHours', next, { shouldDirty: true })
                  }
                />

                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: themeColors.text.primary }]}
                  >
                    {t('request.noteLabel')}
                  </Text>
                  <Controller
                    control={control}
                    name="note"
                    render={({ field: { onChange, value } }) => (
                      <TextAreaWithCounter
                        placeholder={t('request.messagePlaceholder')}
                        value={value ?? ''}
                        onChangeText={onChange}
                        numberOfLines={3}
                        maxLength={500}
                        containerStyle={styles.noteInput}
                      />
                    )}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.bottomContainer,
          {
            backgroundColor: themeColors.background,
            paddingBottom: keyboardOffset > 0 ? spacing.md : insets.bottom + spacing.md,
            bottom:
              keyboardOffset > 0
                ? keyboardOffset + (Platform.OS === 'android' ? 20 : 0)
                : 0,
          },
        ]}
      >
        <Button
          title={t('request.submit')}
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={!isValid || loadingTemplates}
          fullWidth
          icon="send"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
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
  headerTitle: { ...typography.styles.h3 },
  scrollContent: { padding: spacing.lg, paddingBottom: 120 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.styles.h4, marginBottom: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  addButtonText: { ...typography.styles.bodyMedium },
  noteInput: { marginBottom: 0 },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    ...shadows.lg,
  },
});

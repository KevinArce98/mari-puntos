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

import { useFocusEffect, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

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
  useThemedColors,
  useUser,
} from '@/hooks';
import { permissionsService } from '@/services';
import { shadows, spacing, typography } from '@/theme';
import { PermissionTemplate } from '@/types';
import { createUTC6DateTime } from '@/utils/dateUtils';
import { getApiErrorMessage } from '@/utils/errorMessage';
import logger from '@/utils/logger';

export default function RequestPermissionScreen() {
  const { t } = useTranslation(['permissions', 'common', 'errors']);
  const themeColors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { requestPermission } = usePermissions();
  const keyboardOffset = useKeyboardOffset();

  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(
    null
  );
  const [duration, setDuration] = useState(2);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [allowExit, setAllowExit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  useDiscardConfirm({
    enabled: Boolean(selectedTemplate || note.trim()) && !allowExit,
    title: t('request.discard.title'),
    message: t('request.discard.message'),
    confirmLabel: t('request.discard.confirm'),
    cancelLabel: t('common:actions.keepEditing'),
  });

  const loadTemplates = useCallback(async () => {
    try {
      setLoadingTemplates(true);
      const result = await permissionsService.getTemplates();
      setTemplates(result.data || []);
      logger.debug('Permission templates loaded', { count: result.data?.length || 0 });
      if (!result.data || result.data.length === 0) {
        toast.info(t('request.noTemplatesTitle'), {
          description: t('request.noTemplatesMessage'),
        });
      }
    } catch (error) {
      logger.error('Failed to load permission templates', error as Error);
      toast.error(t('errors:title'), { description: t('request.loadTemplatesError') });
    } finally {
      setLoadingTemplates(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      loadTemplates();
    }, [user, loadTemplates])
  );

  const handleTemplateSelect = (template: PermissionTemplate) => {
    setSelectedTemplate(template);
    const suggestedDuration = template.suggestedDurationHours;
    setDuration(
      typeof suggestedDuration === 'number' && suggestedDuration > 0
        ? suggestedDuration
        : 2
    );
  };

  const handleRequest = async () => {
    if (!selectedTemplate) {
      toast.error(t('errors:title'), { description: t('request.selectActivityError') });
      return;
    }

    setLoading(true);
    try {
      const requestedDateTime = createUTC6DateTime(selectedDate, selectedTime);

      await requestPermission({
        templateId: selectedTemplate.id,
        requestedDate: requestedDateTime.toISOString(),
        durationHours: duration,
        metadata: note.trim() ? { note: note.trim() } : undefined,
      });

      logger.info('Permission request submitted', {
        templateId: selectedTemplate.id,
        durationHours: duration,
      });

      toast.success(t('request.sentTitle'), { description: t('request.sentMessage') });

      setAllowExit(true);
      setTimeout(() => router.back(), 0);
    } catch (e) {
      toast.error(t('errors:title'), {
        description: getApiErrorMessage(e) ?? t('request.sendError'),
      });
    } finally {
      setLoading(false);
    }
  };

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
                  date={selectedDate}
                  time={selectedTime}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                />

                <DurationField value={duration} onChange={setDuration} />

                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: themeColors.text.primary }]}
                  >
                    {t('request.noteLabel')}
                  </Text>
                  <TextAreaWithCounter
                    placeholder={t('request.messagePlaceholder')}
                    value={note}
                    onChangeText={setNote}
                    numberOfLines={3}
                    maxLength={500}
                    containerStyle={styles.noteInput}
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

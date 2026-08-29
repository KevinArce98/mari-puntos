import React, { useState } from 'react';

import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { POINT_VALUE_PRESETS } from '@/constants/points';
import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';
import { Action, ActionCategory } from '@/types';
import { formatDateWithTime } from '@/utils';
import logger from '@/utils/logger';
import {
  type ReviewActionFormData,
  reviewActionSchema,
} from '@/validators/action.schema';

import { Button } from './Button';
import { Chip } from './Chip';
import { PressableScale } from './PressableScale';
import { TextAreaWithCounter } from './TextAreaWithCounter';

interface ReviewActionModalProps {
  visible: boolean;
  action: Action | null;
  onClose: () => void;
  onApprove: (actionId: string, points: number) => Promise<void>;
  onReject: (actionId: string, reason: string) => Promise<void>;
}

const CATEGORY_LABEL_KEYS = {
  [ActionCategory.HOUSEHOLD]: 'common:actionCategories.household',
  [ActionCategory.CHILDCARE]: 'common:actionCategories.childcare',
  [ActionCategory.ERRANDS]: 'common:actionCategories.errands',
  [ActionCategory.ROMANTIC]: 'common:actionCategories.romantic',
  [ActionCategory.PERSONAL_GROWTH]: 'common:actionCategories.personal_growth_long',
  [ActionCategory.OTHER]: 'common:actionCategories.other',
} as const satisfies Record<ActionCategory, string>;

export function ReviewActionModal({
  visible,
  action,
  onClose,
  onApprove,
  onReject,
}: ReviewActionModalProps) {
  const { t } = useTranslation(['modals', 'common']);
  const themeColors = useThemedColors();
  const [points, setPoints] = useState(100);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'review' | 'reject'>('review');

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ReviewActionFormData>({
    mode: 'onBlur',
    resolver: zodResolver(reviewActionSchema),
    defaultValues: {
      points: 100,
      rejectionReason: '',
    },
  });

  const handleApprove = () => {
    if (!action) return;

    Alert.alert(
      t('reviewAction.approvePrompt.title'),
      t('reviewAction.approvePrompt.message', { points }),
      [
        { text: t('reviewAction.approvePrompt.cancel'), style: 'cancel' },
        {
          text: t('reviewAction.approvePrompt.confirm'),
          onPress: async () => {
            setLoading(true);
            try {
              await onApprove(action.id, points);
              resetAndClose();
            } catch (error) {
              logger.error('Error approving action', error as Error, {
                actionId: action.id,
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onSubmitReject = async (data: ReviewActionFormData) => {
    if (!action || !data.rejectionReason?.trim()) return;

    setLoading(true);
    try {
      await onReject(action.id, data.rejectionReason.trim());
      resetAndClose();
    } catch (error) {
      logger.error('Error rejecting action', error as Error, { actionId: action.id });
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setPoints(100);
    reset();
    setMode('review');
    onClose();
  };

  const handleClose = () => {
    if (mode === 'reject' && isDirty) {
      Alert.alert(t('reviewAction.discard.title'), t('reviewAction.discard.message'), [
        { text: t('reviewAction.discard.stay'), style: 'cancel' },
        {
          text: t('reviewAction.discard.confirm'),
          style: 'destructive',
          onPress: resetAndClose,
        },
      ]);
      return;
    }
    resetAndClose();
  };

  if (!visible || !action) {
    return null;
  }

  const formattedDate = formatDateWithTime(action.createdAt);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: themeColors.gray[100] }]}
          accessibilityViewIsModal
        >
          <View style={[styles.header, { borderBottomColor: themeColors.gray[200] }]}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              {mode === 'review'
                ? t('reviewAction.reviewTitle')
                : t('reviewAction.rejectTitle')}
            </Text>
            <PressableScale
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('reviewAction.closeA11y')}
            >
              <Ionicons name="close" size={24} color={themeColors.text.primary} />
            </PressableScale>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            <View
              style={[styles.actionDetails, { backgroundColor: themeColors.gray[50] }]}
            >
              <Text style={[styles.actionTitle, { color: themeColors.text.primary }]}>
                {action.title}
              </Text>
              <Text style={[styles.actionCategory, { color: themeColors.primary }]}>
                {t(CATEGORY_LABEL_KEYS[action.category])}
              </Text>
              {action.description && (
                <Text
                  style={[
                    styles.actionDescription,
                    { color: themeColors.text.secondary },
                  ]}
                >
                  {action.description}
                </Text>
              )}
              <Text style={[styles.actionDate, { color: themeColors.gray[400] }]}>
                {formattedDate}
              </Text>
            </View>

            {mode === 'review' ? (
              <View style={styles.section}>
                <View style={styles.pointsHeader}>
                  <Text style={[styles.label, { color: themeColors.text.primary }]}>
                    {t('reviewAction.pointsLabel')}
                  </Text>
                  <View
                    style={[
                      styles.pointsBadge,
                      { backgroundColor: `${themeColors.accent}15` },
                    ]}
                  >
                    <Ionicons name="trophy" size={20} color={themeColors.accent} />
                    <Text style={[styles.pointsValue, { color: themeColors.accent }]}>
                      {points}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.suggestedLabel, { color: themeColors.text.secondary }]}
                >
                  {t('reviewAction.pointsHint')}
                </Text>
                <View style={styles.pointsPresets}>
                  {POINT_VALUE_PRESETS.map((value) => (
                    <Chip
                      key={value}
                      label={String(value)}
                      selected={points === value}
                      onPress={() => setPoints(value)}
                      style={styles.pointsPresetChip}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>
                  {t('reviewAction.rejectReasonLabel')}
                </Text>
                <Controller
                  control={control}
                  name="rejectionReason"
                  render={({ field: { onChange, value } }) => (
                    <TextAreaWithCounter
                      placeholder={t('reviewAction.rejectReasonPlaceholder')}
                      value={value ?? ''}
                      onChangeText={onChange}
                      numberOfLines={4}
                      textAlignVertical="top"
                      maxLength={500}
                    />
                  )}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {mode === 'review' ? (
              <>
                <Button
                  title={t('reviewAction.reject')}
                  variant="outline"
                  onPress={() => setMode('reject')}
                  textStyle={{ color: themeColors.error }}
                  style={[styles.actionButton, { borderColor: themeColors.error }]}
                  disabled={loading}
                  icon="close-circle"
                />
                <Button
                  title={t('reviewAction.approve')}
                  onPress={handleApprove}
                  style={styles.actionButton}
                  disabled={loading}
                  loading={loading}
                  icon="checkmark-circle"
                />
              </>
            ) : (
              <>
                <Button
                  title={t('reviewAction.back')}
                  variant="outline"
                  onPress={() => setMode('review')}
                  style={styles.actionButton}
                  disabled={loading}
                />
                <Button
                  title={t('reviewAction.confirmReject')}
                  onPress={handleSubmit(onSubmitReject)}
                  style={[styles.actionButton, { backgroundColor: themeColors.error }]}
                  disabled={loading}
                  loading={loading}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '90%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.styles.h3,
  },
  closeButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxHeight: 500,
  },
  actionDetails: {
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  actionTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.xs,
  },
  actionCategory: {
    ...typography.styles.caption,
    fontFamily: 'PlusJakartaSans-SemiBold',
    marginBottom: spacing.sm,
  },
  actionDescription: {
    ...typography.styles.body,
    marginBottom: spacing.sm,
  },
  actionDate: {
    ...typography.styles.caption,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.styles.bodyMedium,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  pointsValue: {
    ...typography.styles.h3,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  suggestedLabel: {
    ...typography.styles.caption,
    marginBottom: spacing.sm,
  },
  pointsPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pointsPresetChip: {
    marginRight: 0,
  },
  textArea: {
    ...typography.styles.body,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

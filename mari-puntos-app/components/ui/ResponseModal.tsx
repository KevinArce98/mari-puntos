import { useEffect, useState } from 'react';

import { Alert, StyleSheet, Text, View } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { POINT_VALUE_PRESETS } from '@/constants/points';
import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';
import {
  type ResponseMessageFormData,
  responseMessageSchema,
} from '@/validators/action.schema';

import { BottomSheetModal } from './BottomSheetModal';
import { Button } from './Button';
import { Chip } from './Chip';
import { ControlledInput } from './ControlledInput';

interface ResponseModalProps {
  visible: boolean;
  onClose: () => void;
  onApprove: (data: ResponseMessageFormData) => Promise<void> | void;
  onReject: (data: ResponseMessageFormData) => Promise<void> | void;
  permissionTitle: string;
  suggestedPointsCost?: number;
  requesterPoints?: number;
  loading?: boolean;
}

function nearestPreset(value: number): number {
  return POINT_VALUE_PRESETS.reduce((closest, preset) =>
    Math.abs(preset - value) < Math.abs(closest - value) ? preset : closest
  );
}

export function ResponseModal({
  visible,
  onClose,
  onApprove,
  onReject,
  permissionTitle,
  suggestedPointsCost,
  requesterPoints,
  loading = false,
}: ResponseModalProps) {
  const { t } = useTranslation(['modals', 'common']);
  const themeColors = useThemedColors();
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);

  const [prevLoading, setPrevLoading] = useState(loading);
  if (loading !== prevLoading) {
    setPrevLoading(loading);
    if (!loading) setPendingAction(null);
  }

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty },
  } = useForm<ResponseMessageFormData>({
    mode: 'onBlur',
    resolver: zodResolver(responseMessageSchema),
    defaultValues: {
      message: '',
      pointsCost:
        suggestedPointsCost && suggestedPointsCost > 0
          ? nearestPreset(suggestedPointsCost)
          : undefined,
    },
  });

  useEffect(() => {
    if (!visible) return;
    reset({
      message: '',
      pointsCost:
        suggestedPointsCost && suggestedPointsCost > 0
          ? nearestPreset(suggestedPointsCost)
          : undefined,
    });
  }, [reset, suggestedPointsCost, visible]);

  const onSubmitApprove = (data: ResponseMessageFormData) => {
    const cost = data.pointsCost ?? 0;
    if (cost < 1) {
      setError('pointsCost', {
        type: 'manual',
        message: t('response.selectCost'),
      });
      return;
    }
    if (requesterPoints != null && cost > requesterPoints) {
      setError('pointsCost', {
        type: 'manual',
        message: t('response.partnerBudget', {
          points: requesterPoints.toLocaleString(),
        }),
      });
      return;
    }

    const submit = async () => {
      setPendingAction('approve');
      try {
        await onApprove(data);
        reset();
      } finally {
        setPendingAction(null);
      }
    };

    Alert.alert(
      t('response.approvePrompt.title'),
      t('response.approvePrompt.message', { points: cost }),
      [
        { text: t('response.approvePrompt.cancel'), style: 'cancel' },
        { text: t('response.approvePrompt.confirm'), onPress: submit },
      ]
    );
  };

  const onSubmitReject = async (data: ResponseMessageFormData) => {
    setPendingAction('reject');
    try {
      await onReject({ ...data, pointsCost: undefined });
      reset();
    } finally {
      setPendingAction(null);
    }
  };

  const handleClose = () => {
    const close = () => {
      reset();
      onClose();
    };

    if (isDirty) {
      Alert.alert(t('response.discard.title'), t('response.discard.message'), [
        { text: t('response.discard.stay'), style: 'cancel' },
        {
          text: t('response.discard.confirm'),
          style: 'destructive',
          onPress: close,
        },
      ]);
      return;
    }
    close();
  };

  return (
    <BottomSheetModal
      visible={visible}
      onRequestClose={handleClose}
      title={t('response.title')}
      closeAccessibilityLabel={t('response.closeA11y')}
      footer={
        <View style={styles.actionButtons}>
          <Button
            title={t('response.reject')}
            onPress={handleSubmit(onSubmitReject)}
            variant="outline"
            textStyle={{ color: themeColors.error }}
            style={[styles.actionButton, { borderColor: themeColors.error }]}
            loading={pendingAction === 'reject'}
            disabled={loading}
          />
          <Button
            title={t('response.approve')}
            onPress={handleSubmit(onSubmitApprove)}
            variant="primary"
            style={styles.actionButton}
            loading={pendingAction === 'approve'}
            disabled={loading}
          />
        </View>
      }
    >
      <View style={styles.content}>
        <View
          style={[styles.permissionInfo, { backgroundColor: themeColors.background }]}
        >
          <Text style={[styles.permissionLabel, { color: themeColors.text.secondary }]}>
            {t('response.requestLabel')}
          </Text>
          <Text style={[styles.permissionTitle, { color: themeColors.text.primary }]}>
            {permissionTitle}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: themeColors.text.primary }]}>
            {t('response.pointsCostLabel')}
          </Text>
          <Controller
            control={control}
            name="pointsCost"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <View style={styles.pointsPresets}>
                  {POINT_VALUE_PRESETS.map((preset) => {
                    const overBudget =
                      requesterPoints != null && preset > requesterPoints;
                    return (
                      <Chip
                        key={preset}
                        label={String(preset)}
                        selected={value === preset}
                        onPress={
                          loading || overBudget ? undefined : () => onChange(preset)
                        }
                        style={StyleSheet.flatten([
                          styles.pointsPresetChip,
                          overBudget && styles.pointsPresetChipDisabled,
                        ])}
                      />
                    );
                  })}
                </View>
                {error?.message && (
                  <Text style={[styles.errorText, { color: themeColors.error }]}>
                    {error.message}
                  </Text>
                )}
              </>
            )}
          />
          {requesterPoints != null && (
            <Text style={[styles.balanceHint, { color: themeColors.text.secondary }]}>
              {t('response.availableBalance', {
                points: requesterPoints.toLocaleString(),
              })}
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: themeColors.text.primary }]}>
            {t('response.messageLabel')}
          </Text>
          <ControlledInput
            control={control}
            name="message"
            placeholder={t('response.messagePlaceholder')}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  permissionInfo: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  permissionLabel: {
    ...typography.styles.caption,
    marginBottom: spacing.xs,
  },
  permissionTitle: {
    ...typography.styles.bodyLarge,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.styles.body,
    marginBottom: spacing.sm,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  textArea: {
    ...typography.styles.body,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    borderWidth: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  pointsPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pointsPresetChip: {
    marginRight: 0,
  },
  pointsPresetChipDisabled: {
    opacity: 0.35,
  },
  errorText: {
    ...typography.styles.caption,
    marginTop: spacing.sm,
  },
  balanceHint: {
    ...typography.styles.caption,
    marginTop: spacing.sm,
  },
});

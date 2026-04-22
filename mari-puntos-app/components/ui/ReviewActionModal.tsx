import React, { useState } from 'react';

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import Slider from '@react-native-community/slider';
import { Controller, useForm } from 'react-hook-form';

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
import { TextAreaWithCounter } from './TextAreaWithCounter';

interface ReviewActionModalProps {
  visible: boolean;
  action: Action | null;
  onClose: () => void;
  onApprove: (actionId: string, points: number) => Promise<void>;
  onReject: (actionId: string, reason: string) => Promise<void>;
}

const CATEGORY_LABELS: Record<ActionCategory, string> = {
  [ActionCategory.HOUSEHOLD]: 'Hogar',
  [ActionCategory.CHILDCARE]: 'Cuidado Niños',
  [ActionCategory.ERRANDS]: 'Mandados',
  [ActionCategory.ROMANTIC]: 'Romántico',
  [ActionCategory.PERSONAL_GROWTH]: 'Crecimiento Personal',
  [ActionCategory.OTHER]: 'Otro',
};

export function ReviewActionModal({
  visible,
  action,
  onClose,
  onApprove,
  onReject,
}: ReviewActionModalProps) {
  const themeColors = useThemedColors();
  const [points, setPoints] = useState(100);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'review' | 'reject'>('review');

  const { control, handleSubmit, reset } = useForm<ReviewActionFormData>({
    resolver: zodResolver(reviewActionSchema),
    defaultValues: {
      points: 100,
      rejectionReason: '',
    },
  });

  const handleApprove = async () => {
    if (!action) return;

    setLoading(true);
    try {
      await onApprove(action.id, points);
      resetAndClose();
    } catch (error) {
      logger.error('Error approving action', error as Error, { actionId: action.id });
    } finally {
      setLoading(false);
    }
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

  if (!visible || !action) {
    return null;
  }

  const formattedDate = formatDateWithTime(action.createdAt);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={resetAndClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: themeColors.gray[100] }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.gray[200] }]}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              {mode === 'review' ? 'Revisar Acción' : 'Rechazar Acción'}
            </Text>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={themeColors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {/* Action Details */}
            <View
              style={[styles.actionDetails, { backgroundColor: themeColors.gray[50] }]}
            >
              <Text style={[styles.actionTitle, { color: themeColors.text.primary }]}>
                {action.title}
              </Text>
              <Text style={[styles.actionCategory, { color: themeColors.primary }]}>
                {CATEGORY_LABELS[action.category]}
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
              /* Points Slider */
              <View style={styles.section}>
                <View style={styles.pointsHeader}>
                  <Text style={[styles.label, { color: themeColors.text.primary }]}>
                    Puntos a otorgar
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
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1000}
                  step={10}
                  value={points}
                  onValueChange={setPoints}
                  minimumTrackTintColor={themeColors.primary}
                  maximumTrackTintColor={themeColors.gray[300]}
                  thumbTintColor={themeColors.primary}
                />
                <View style={styles.sliderLabels}>
                  <Text style={[styles.sliderLabel, { color: themeColors.gray[400] }]}>
                    0
                  </Text>
                  <Text style={[styles.sliderLabel, { color: themeColors.gray[400] }]}>
                    1000
                  </Text>
                </View>
                <View style={styles.suggestedPoints}>
                  <Text
                    style={[styles.suggestedLabel, { color: themeColors.text.secondary }]}
                  >
                    Sugerencias:
                  </Text>
                  <View style={styles.suggestedButtons}>
                    {[50, 100, 250, 500].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.suggestedButton,
                          { backgroundColor: themeColors.gray[100] },
                          points === value && [
                            styles.suggestedButtonActive,
                            {
                              backgroundColor: `${themeColors.primary}15`,
                              borderColor: themeColors.primary,
                            },
                          ],
                        ]}
                        onPress={() => setPoints(value)}
                      >
                        <Text
                          style={[
                            styles.suggestedButtonText,
                            { color: themeColors.gray[600] },
                            points === value && [
                              styles.suggestedButtonTextActive,
                              { color: themeColors.primary },
                            ],
                          ]}
                        >
                          {value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              /* Rejection Reason */
              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>
                  Motivo del rechazo *
                </Text>
                <Controller
                  control={control}
                  name="rejectionReason"
                  render={({ field: { onChange, value } }) => (
                    <TextAreaWithCounter
                      placeholder="Explica por qué estás rechazando esta acción..."
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

          {/* Actions */}
          <View style={styles.actions}>
            {mode === 'review' ? (
              <>
                <Button
                  title="Rechazar"
                  variant="danger"
                  onPress={() => setMode('reject')}
                  style={styles.actionButton}
                  disabled={loading}
                  icon="close-circle"
                />
                <Button
                  title="Aprobar"
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
                  title="Volver"
                  variant="outline"
                  onPress={() => setMode('review')}
                  style={styles.actionButton}
                  disabled={loading}
                />
                <Button
                  title="Confirmar Rechazo"
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
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sliderLabel: {
    ...typography.styles.caption,
  },
  suggestedPoints: {
    marginTop: spacing.sm,
  },
  suggestedLabel: {
    ...typography.styles.caption,
    marginBottom: spacing.sm,
  },
  suggestedButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  suggestedButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  suggestedButtonActive: {},
  suggestedButtonText: {
    ...typography.styles.bodyMedium,
  },
  suggestedButtonTextActive: {
    fontFamily: 'PlusJakartaSans-SemiBold',
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

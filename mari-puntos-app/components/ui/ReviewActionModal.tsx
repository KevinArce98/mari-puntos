import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Action, ActionCategory } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Button } from './Button';
import { formatDate } from '@/utils/general';

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
  const [points, setPoints] = useState(100);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'review' | 'reject'>('review');

  const handleApprove = async () => {
    if (!action) return;

    setLoading(true);
    try {
      await onApprove(action.id, points);
      resetAndClose();
    } catch (error) {
      console.error('Error approving action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!action || !rejectionReason.trim()) return;

    setLoading(true);
    try {
      await onReject(action.id, rejectionReason.trim());
      resetAndClose();
    } catch (error) {
      console.error('Error rejecting action:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setPoints(100);
    setRejectionReason('');
    setMode('review');
    onClose();
  };

  if (!visible || !action) {
    return null;
  }

  const formattedDate = formatDate(action.createdAt);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={resetAndClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'review' ? 'Revisar Acción' : 'Rechazar Acción'}
            </Text>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {/* Action Details */}
            <View style={styles.actionDetails}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionCategory}>
                {CATEGORY_LABELS[action.category]}
              </Text>
              {action.description && (
                <Text style={styles.actionDescription}>{action.description}</Text>
              )}
              <Text style={styles.actionDate}>{formattedDate}</Text>
            </View>

            {mode === 'review' ? (
              /* Points Slider */
              <View style={styles.section}>
                <View style={styles.pointsHeader}>
                  <Text style={styles.label}>Puntos a otorgar</Text>
                  <View style={styles.pointsBadge}>
                    <Ionicons name="trophy" size={20} color={colors.accent} />
                    <Text style={styles.pointsValue}>{points}</Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1000}
                  step={10}
                  value={points}
                  onValueChange={setPoints}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.gray[300]}
                  thumbTintColor={colors.primary}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>0</Text>
                  <Text style={styles.sliderLabel}>1000</Text>
                </View>
                <View style={styles.suggestedPoints}>
                  <Text style={styles.suggestedLabel}>Sugerencias:</Text>
                  <View style={styles.suggestedButtons}>
                    {[50, 100, 250, 500].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.suggestedButton,
                          points === value && styles.suggestedButtonActive,
                        ]}
                        onPress={() => setPoints(value)}
                      >
                        <Text
                          style={[
                            styles.suggestedButtonText,
                            points === value && styles.suggestedButtonTextActive,
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
                <Text style={styles.label}>Motivo del rechazo *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Explica por qué estás rechazando esta acción..."
                  placeholderTextColor={colors.gray[400]}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
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
                  onPress={handleReject}
                  style={[styles.actionButton, { backgroundColor: colors.error }]}
                  disabled={!rejectionReason.trim() || loading}
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
    backgroundColor: colors.white,
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
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    maxHeight: 500,
  },
  actionDetails: {
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  actionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  actionCategory: {
    ...typography.styles.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  actionDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  actionDate: {
    ...typography.styles.caption,
    color: colors.gray[400],
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
    color: colors.text.primary,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.accent}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  pointsValue: {
    ...typography.styles.h3,
    color: colors.accent,
    fontWeight: 'bold',
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
    color: colors.gray[400],
  },
  suggestedPoints: {
    marginTop: spacing.sm,
  },
  suggestedLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  suggestedButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  suggestedButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  suggestedButtonActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  suggestedButtonText: {
    ...typography.styles.bodyMedium,
    color: colors.gray[600],
  },
  suggestedButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  textArea: {
    ...typography.styles.body,
    color: colors.text.primary,
    backgroundColor: colors.gray[100],
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

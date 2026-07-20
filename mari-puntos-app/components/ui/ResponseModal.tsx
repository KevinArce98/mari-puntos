import React, { useEffect, useState } from 'react';

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';
import {
  type ResponseMessageFormData,
  responseMessageSchema,
} from '@/validators/action.schema';

import { Button } from './Button';
import { ControlledInput } from './ControlledInput';
import { Input } from './Input';
import { PressableScale } from './PressableScale';

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
  const themeColors = useThemedColors();
  const insets = useSafeAreaInsets();
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!loading) setPendingAction(null);
  }, [loading]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardOffset(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

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
        suggestedPointsCost && suggestedPointsCost > 0 ? suggestedPointsCost : undefined,
    },
  });

  useEffect(() => {
    if (!visible) return;
    reset({
      message: '',
      pointsCost:
        suggestedPointsCost && suggestedPointsCost > 0 ? suggestedPointsCost : undefined,
    });
  }, [reset, suggestedPointsCost, visible]);

  const onSubmitApprove = (data: ResponseMessageFormData) => {
    const cost = data.pointsCost ?? 0;
    if (cost < 1) {
      setError('pointsCost', {
        type: 'manual',
        message: 'Ingresa un costo entre 1 y 1000 puntos',
      });
      return;
    }
    if (requesterPoints != null && cost > requesterPoints) {
      setError('pointsCost', {
        type: 'manual',
        message: `Tu pareja tiene ${requesterPoints.toLocaleString()} puntos disponibles`,
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
      'Confirmar aprobación',
      `Se descontarán ${cost} MariPuntos del saldo de tu pareja. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aprobar', onPress: submit },
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
      Alert.alert(
        'Descartar respuesta',
        'Perderás los cambios que todavía no has enviado.',
        [
          { text: 'Seguir editando', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: close },
        ]
      );
      return;
    }
    close();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.overlay,
          Platform.OS === 'android' && {
            paddingTop: insets.top,
            paddingBottom: keyboardOffset > 0 ? keyboardOffset + 20 : insets.bottom,
          },
        ]}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: themeColors.surface,
              paddingBottom:
                Platform.OS === 'ios' ? insets.bottom + spacing.md : spacing.md,
            },
          ]}
          accessibilityViewIsModal
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              Responder permiso
            </Text>
            <PressableScale
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Cerrar respuesta"
            >
              <Ionicons name="close" size={24} color={themeColors.text.secondary} />
            </PressableScale>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* Permission Title */}
            <View
              style={[styles.permissionInfo, { backgroundColor: themeColors.background }]}
            >
              <Text
                style={[styles.permissionLabel, { color: themeColors.text.secondary }]}
              >
                Solicitud:
              </Text>
              <Text style={[styles.permissionTitle, { color: themeColors.text.primary }]}>
                {permissionTitle}
              </Text>
            </View>

            {/* Points Cost Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: themeColors.text.primary }]}>
                Costo en puntos *
              </Text>
              <Controller
                control={control}
                name="pointsCost"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <Input
                    placeholder="Ejemplo: 50"
                    keyboardType="numeric"
                    value={value?.toString() || ''}
                    onChangeText={(text) => {
                      const numValue = text ? Number.parseInt(text, 10) : undefined;
                      onChange(numValue);
                    }}
                    onBlur={onBlur}
                    error={error?.message}
                    editable={!loading}
                  />
                )}
              />
              {requesterPoints != null && (
                <Text style={[styles.balanceHint, { color: themeColors.text.secondary }]}>
                  Saldo disponible: {requesterPoints.toLocaleString()} MariPuntos
                </Text>
              )}
            </View>

            {/* Message Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: themeColors.text.primary }]}>
                Mensaje de respuesta (opcional)
              </Text>
              <ControlledInput
                control={control}
                name="message"
                placeholder="Escribe un mensaje para tu pareja..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>
          </ScrollView>

          <View style={styles.actionButtons}>
            <Button
              title="Rechazar"
              onPress={handleSubmit(onSubmitReject)}
              variant="outline"
              textStyle={{ color: themeColors.error }}
              style={[styles.actionButton, { borderColor: themeColors.error }]}
              loading={pendingAction === 'reject'}
              disabled={loading}
            />
            <Button
              title="Aprobar"
              onPress={handleSubmit(onSubmitApprove)}
              variant="primary"
              style={styles.actionButton}
              loading={pendingAction === 'approve'}
              disabled={loading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    width: '100%',
    maxHeight: '92%',
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.styles.h3,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  balanceHint: {
    ...typography.styles.caption,
    marginTop: -spacing.sm,
  },
});

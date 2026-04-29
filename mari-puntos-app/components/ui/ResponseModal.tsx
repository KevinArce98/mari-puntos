import React, { useEffect, useState } from 'react';

import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemedColors } from '@/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';
import {
  type ResponseMessageFormData,
  responseMessageSchema,
} from '@/validators/action.schema';

import { Button } from './Button';
import { ControlledInput } from './ControlledInput';
import { Input } from './Input';

interface ResponseModalProps {
  visible: boolean;
  onClose: () => void;
  onApprove: (data: ResponseMessageFormData) => void;
  onReject: (data: ResponseMessageFormData) => void;
  permissionTitle: string;
  loading?: boolean;
}

export function ResponseModal({
  visible,
  onClose,
  onApprove,
  onReject,
  permissionTitle,
  loading = false,
}: ResponseModalProps) {
  const themeColors = useThemedColors();
  const insets = useSafeAreaInsets();
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Reset which button is spinning whenever the parent finishes its async work.
  useEffect(() => {
    if (!loading) setPendingAction(null);
  }, [loading]);

  // Modal creates its own Android window that doesn't inherit `adjustResize`,
  // so track the keyboard manually to lift the modal above it.
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

  const { control, handleSubmit, reset } = useForm<ResponseMessageFormData>({
    resolver: zodResolver(responseMessageSchema),
    defaultValues: {
      message: '',
      pointsCost: 0,
    },
  });

  const onSubmitApprove = (data: ResponseMessageFormData) => {
    setPendingAction('approve');
    onApprove(data);
    reset();
  };

  const onSubmitReject = (data: ResponseMessageFormData) => {
    setPendingAction('reject');
    onReject(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
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
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={[styles.modalContainer, { backgroundColor: themeColors.gray[100] }]}
              onStartShouldSetResponder={() => true}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text.primary }]}>
                  Responder Permiso
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color={themeColors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Permission Title */}
              <View
                style={[
                  styles.permissionInfo,
                  { backgroundColor: themeColors.background },
                ]}
              >
                <Text
                  style={[styles.permissionLabel, { color: themeColors.text.secondary }]}
                >
                  Solicitud:
                </Text>
                <Text
                  style={[styles.permissionTitle, { color: themeColors.text.primary }]}
                >
                  {permissionTitle}
                </Text>
              </View>

              {/* Points Cost Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: themeColors.text.primary }]}>
                  Costo en Puntos *
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
                        const numValue = parseInt(text) || '';
                        onChange(numValue);
                      }}
                      onBlur={onBlur}
                      error={error?.message}
                      editable={!loading}
                    />
                  )}
                />
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

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  title="Rechazar"
                  textStyle={styles.rejectButtonText}
                  onPress={handleSubmit(onSubmitReject)}
                  variant="outline"
                  style={[styles.actionButton, styles.rejectButton]}
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
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 500,
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.styles.h3,
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
    marginBottom: spacing.xl,
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
  },
  actionButton: {
    flex: 1,
  },
  rejectButton: {
    backgroundColor: colors.light.error,
    borderColor: colors.light.error,
  },
  rejectButtonText: {
    color: colors.light.white,
  },
});

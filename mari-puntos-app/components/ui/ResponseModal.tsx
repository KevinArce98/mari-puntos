import React from 'react';
import {
  Keyboard,
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Button } from './Button';
import { Input } from './Input';
import {
  responseMessageSchema,
  type ResponseMessageFormData,
} from '@/validators/action.schema';
import { ControlledInput } from './ControlledInput';

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
  const { control, handleSubmit, reset } = useForm<ResponseMessageFormData>({
    resolver: zodResolver(responseMessageSchema),
    defaultValues: {
      message: '',
      pointsCost: 0,
    },
  });

  const onSubmitApprove = (data: ResponseMessageFormData) => {
    onApprove(data);
    reset();
  };

  const onSubmitReject = (data: ResponseMessageFormData) => {
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
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Responder Permiso</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Permission Title */}
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionLabel}>Solicitud:</Text>
                <Text style={styles.permissionTitle}>{permissionTitle}</Text>
              </View>

              {/* Points Cost Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Costo en Puntos *</Text>
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
                <Text style={styles.inputLabel}>Mensaje de respuesta (opcional)</Text>
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
                  disabled={loading}
                />
                <Button
                  title="Aprobar"
                  onPress={handleSubmit(onSubmitApprove)}
                  variant="primary"
                  style={styles.actionButton}
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
    backgroundColor: colors.white,
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
    color: colors.text.primary,
  },
  permissionInfo: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  permissionLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  permissionTitle: {
    ...typography.styles.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.styles.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  textArea: {
    ...typography.styles.body,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  rejectButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  rejectButtonText: {
    color: colors.white,
  },
});

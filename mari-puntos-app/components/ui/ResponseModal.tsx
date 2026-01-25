import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Button } from './Button';

interface ResponseModalProps {
  visible: boolean;
  onClose: () => void;
  onApprove: (message: string) => void;
  onReject: (message: string) => void;
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
  const [message, setMessage] = useState('');

  const handleApprove = () => {
    onApprove(message);
    setMessage('');
  };

  const handleReject = () => {
    onReject(message);
    setMessage('');
  };

  const handleClose = () => {
    setMessage('');
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
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContainer}>
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

              {/* Message Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mensaje de respuesta (opcional)</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Escribe un mensaje para tu pareja..."
                  placeholderTextColor={colors.text.secondary}
                  multiline
                  numberOfLines={4}
                  value={message}
                  onChangeText={setMessage}
                  editable={!loading}
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  title="Rechazar"
                  textStyle={styles.rejectButtonText}
                  onPress={handleReject}
                  variant="outline"
                  style={[styles.actionButton, styles.rejectButton]}
                  disabled={loading}
                />
                <Button
                  title="Aprobar"
                  onPress={handleApprove}
                  variant="primary"
                  style={styles.actionButton}
                  disabled={loading}
                />
              </View>
            </View>
          </TouchableOpacity>
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
    width: '100%',
    maxWidth: 500,
    shadowColor: colors.gray[500],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    width: 300,
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

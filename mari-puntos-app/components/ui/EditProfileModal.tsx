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

import { Image } from 'expo-image';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';

import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';
import logger from '@/utils/logger';
import {
  type UpdateProfileFormData,
  updateProfileSchema,
} from '@/validators/profile.schema';

import { Button } from './Button';
import { ControlledInput } from './ControlledInput';
import { PressableScale } from './PressableScale';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProfileFormData & { profileImage?: string }) => Promise<void>;
  currentFirstName?: string;
  currentLastName?: string;
  currentAvatarUrl?: string;
}

export function EditProfileModal({
  visible,
  onClose,
  onSubmit,
  currentFirstName = '',
  currentLastName = '',
  currentAvatarUrl,
}: EditProfileModalProps) {
  const themeColors = useThemedColors();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

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
    formState: { isDirty, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    mode: 'onBlur',
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: currentFirstName,
      lastName: currentLastName,
    },
  });

  const requestPermissions = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos permisos para acceder a tu galería de fotos.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // Pick at full quality, then downscale/compress locally before encoding.
      // Avatars are displayed at 120px, so 512px is plenty and keeps the
      // base64 payload an order of magnitude smaller than the raw camera image.
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const manipulated = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.7, format: SaveFormat.JPEG, base64: true }
      );

      if (manipulated.base64) {
        setSelectedImage(`data:image/jpeg;base64,${manipulated.base64}`);
      }
    } catch (error) {
      logger.error('Error selecting profile image', error as Error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const onSubmitForm = async (data: UpdateProfileFormData) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        profileImage: selectedImage || undefined,
      });
      reset();
      setSelectedImage(null);
      onClose();
    } catch (error) {
      logger.error('Error updating profile', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    const close = () => {
      reset();
      setSelectedImage(null);
      onClose();
    };

    if (isDirty || selectedImage) {
      Alert.alert(
        'Descartar cambios',
        'Perderás los cambios que todavía no has guardado.',
        [
          { text: 'Seguir editando', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: close },
        ]
      );
      return;
    }
    close();
  };

  const displayImage = selectedImage || currentAvatarUrl;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.keyboardAvoidingView, { paddingBottom: keyboardOffset }]}
        >
          <View
            style={[styles.container, { backgroundColor: themeColors.gray[100] }]}
            accessibilityViewIsModal
          >
            <View style={[styles.header, { borderBottomColor: themeColors.gray[200] }]}>
              <Text style={[styles.title, { color: themeColors.text.primary }]}>
                Editar perfil
              </Text>
              <PressableScale
                onPress={handleClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Cerrar edición de perfil"
              >
                <Ionicons name="close" size={24} color={themeColors.text.primary} />
              </PressableScale>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>
                  Foto de perfil
                </Text>
                <PressableScale
                  style={styles.avatarContainer}
                  onPress={pickImage}
                  accessibilityRole="button"
                  accessibilityLabel="Cambiar foto de perfil"
                >
                  {displayImage ? (
                    <Image
                      source={displayImage}
                      style={[styles.avatar, { backgroundColor: themeColors.gray[200] }]}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatarPlaceholder,
                        { backgroundColor: themeColors.gray[200] },
                      ]}
                    >
                      <Ionicons name="person" size={48} color={themeColors.gray[400]} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.avatarEditBadge,
                      {
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.white,
                      },
                    ]}
                  >
                    <Ionicons name="camera" size={16} color={themeColors.white} />
                  </View>
                </PressableScale>
                <Text style={[styles.hint, { color: themeColors.text.secondary }]}>
                  Toca para cambiar tu foto
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>
                  Nombre *
                </Text>
                <ControlledInput
                  control={control}
                  name="firstName"
                  placeholder="Ej: Juan"
                  maxLength={100}
                />
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>
                  Apellido *
                </Text>
                <ControlledInput
                  control={control}
                  name="lastName"
                  placeholder="Ej: Pérez"
                  maxLength={100}
                />
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={handleClose}
                style={styles.actionButton}
                disabled={loading}
              />
              <Button
                title="Guardar"
                onPress={handleSubmit(onSubmitForm)}
                style={styles.actionButton}
                disabled={isSubmitting}
                loading={loading}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
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
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  label: {
    ...typography.styles.bodyMedium,
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  hint: {
    ...typography.styles.caption,
    textAlign: 'center',
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

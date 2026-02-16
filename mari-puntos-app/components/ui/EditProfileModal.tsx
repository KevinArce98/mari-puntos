import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Button, ControlledInput } from '@/components/ui';
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '@/validators/profile.schema';

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
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UpdateProfileFormData>({
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
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setSelectedImage(base64Image);
      }
    } catch {
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
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedImage(null);
    onClose();
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Editar Perfil</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.label}>Foto de Perfil</Text>
                <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                  {displayImage ? (
                    <Image source={{ uri: displayImage }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={48} color={colors.gray[400]} />
                    </View>
                  )}
                  <View style={styles.avatarEditBadge}>
                    <Ionicons name="camera" size={16} color={colors.white} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.hint}>Toca para cambiar tu foto</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Nombre *</Text>
                <ControlledInput
                  control={control}
                  name="firstName"
                  placeholder="Ej: Juan"
                  maxLength={100}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Apellido *</Text>
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
  section: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  label: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
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
    backgroundColor: colors.gray[200],
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  hint: {
    ...typography.styles.caption,
    color: colors.text.secondary,
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

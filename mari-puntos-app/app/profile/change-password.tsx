import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';
import { Button } from '@/components/ui';
import { ControlledInput } from '@/components/ui/ControlledInput';
import { useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { hasPasswordSymbol, passwordSchema } from '@/validators/password.rules';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Debes confirmar tu nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const colors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);

  const hasPasswordAuth = isLoaded
    ? user?.externalAccounts?.length === 0 || user?.passwordEnabled
    : true;

  const { control, handleSubmit, watch, reset } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const hasSymbol = hasPasswordSymbol(newPassword);

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await user.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      Toast.show({
        type: 'success',
        text1: 'Contraseña actualizada',
        text2: 'Tu contraseña ha sido cambiada correctamente',
      });
      router.back();
    } catch (error: any) {
      const message =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        'No se pudo cambiar la contraseña';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS !== 'ios' ? insets.top : 0,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Cambiar Contraseña
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {!hasPasswordAuth ? (
        <View style={styles.noPasswordContainer}>
          <Ionicons name="logo-google" size={48} color={colors.gray[400]} />
          <Text style={[styles.noPasswordTitle, { color: colors.text.primary }]}>
            Cuenta OAuth
          </Text>
          <Text style={[styles.noPasswordText, { color: colors.text.secondary }]}>
            Tu cuenta está vinculada con un proveedor externo (Google/Apple). No puedes
            cambiar la contraseña desde aquí.
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ControlledInput
              control={control}
              name="currentPassword"
              label="Contraseña actual"
              secureTextEntry
              leftIcon="lock-closed-outline"
            />
            <ControlledInput
              control={control}
              name="newPassword"
              label="Nueva contraseña"
              secureTextEntry
              leftIcon="lock-open-outline"
            />
            <Text
              style={[
                styles.passwordRule,
                { color: hasSymbol ? colors.success : colors.text.secondary },
              ]}
            >
              Debe contener al menos un símbolo (ej. !@#$)
            </Text>
            <ControlledInput
              control={control}
              name="confirmNewPassword"
              label="Confirmar nueva contraseña"
              secureTextEntry
              leftIcon="checkmark-circle-outline"
            />

            <Button
              title="Guardar Contraseña"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              icon="checkmark"
              style={styles.submitButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.styles.h3,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  submitButton: {
    marginTop: spacing.md,
  },
  passwordRule: {
    ...typography.styles.caption,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  noPasswordContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  noPasswordTitle: {
    ...typography.styles.h3,
    textAlign: 'center',
  },
  noPasswordText: {
    ...typography.styles.body,
    textAlign: 'center',
  },
});

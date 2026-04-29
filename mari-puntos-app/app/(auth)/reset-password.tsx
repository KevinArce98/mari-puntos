import React, { useState } from 'react';

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Button, ControlledCodeInput, ControlledInput } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { handleClerkErrors } from '@/types/clerk-localization';
import { resetPasswordSchema } from '@/validators/auth.schema';
import type { ResetPasswordFormData } from '@/validators/auth.schema';
import { hasPasswordSymbol } from '@/validators/password.rules';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const hasSymbol = hasPasswordSymbol(password);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!isLoaded) return;

    try {
      // First, attempt the first factor with the code
      const attemptResult = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: data.code,
      });

      if (attemptResult.status === 'needs_new_password') {
        // Now reset the password
        const resetResult = await signIn.resetPassword({
          password: data.password,
        });

        if (resetResult.status === 'complete') {
          await setActive({ session: resetResult.createdSessionId });
          router.replace('/(tabs)');
          Toast.show({
            type: 'success',
            text1: 'Contraseña restablecida',
            text2: 'Tu contraseña ha sido cambiada exitosamente',
          });
        }
      }
    } catch (error: any) {
      let errorMessage = 'Error al restablecer la contraseña';

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.xl,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              Restablecer contraseña
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Ingresa el código que enviamos a {email} y tu nueva contraseña
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="password"
              label="Nueva contraseña"
              placeholder="Ingresa tu nueva contraseña"
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Text
              style={[
                styles.passwordRule,
                { color: hasSymbol ? themeColors.success : themeColors.text.secondary },
              ]}
            >
              Debe contener al menos un símbolo (ej. !@#$)
            </Text>

            <ControlledInput
              control={control}
              name="confirmPassword"
              label="Confirmar contraseña"
              placeholder="Confirma tu nueva contraseña"
              secureTextEntry={!showConfirmPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <View style={styles.codeInputContainer}>
              <Text style={[styles.codeLabel, { color: themeColors.text.primary }]}>
                Código de verificación
              </Text>
              <ControlledCodeInput
                control={control}
                name="code"
                length={6}
                type="numeric"
              />
            </View>

            <Button
              title="Restablecer contraseña"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
            />
          </View>

          {/* Back */}
          <View style={styles.backContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backLink, { color: themeColors.primary }]}>
                Volver
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.lg,
  },
  passwordRule: {
    ...typography.styles.caption,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  codeInputContainer: {
    marginBottom: spacing.md,
  },
  codeLabel: {
    ...typography.styles.bodyMedium,
    marginBottom: spacing.xs,
  },
  backContainer: {
    alignItems: 'center',
  },
  backLink: {
    ...typography.styles.bodyMedium,
  },
});

import React from 'react';

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

import { useRouter } from 'expo-router';

import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Button, ControlledInput } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { handleClerkErrors } from '@/types/clerk-localization';
import logger from '@/utils/logger';
import { forgotPasswordSchema } from '@/validators/auth.schema';
import type { ForgotPasswordFormData } from '@/validators/auth.schema';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { signIn, isLoaded } = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: data.email,
        strategy: 'reset_password_email_code',
      });

      if (result.status === 'needs_first_factor') {
        logger.info('Password reset email sent', { email: data.email });
        // Navigate to reset password screen
        router.push({
          pathname: '/(auth)/reset-password',
          params: { email: data.email },
        });
      }
    } catch (error: any) {
      let errorMessage = 'Error al enviar el correo de recuperación';

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      logger.error('Failed to send password reset email', error, {
        email: data.email,
        errorMessage,
      });

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
              Olvidé mi contraseña
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Ingresa tu correo electrónico y te enviaremos un código para restablecer tu
              contraseña
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="email"
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Button
              title="Enviar código"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
            />
          </View>

          {/* Back to Login */}
          <View style={styles.backContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backLink, { color: themeColors.primary }]}>
                Volver al inicio de sesión
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
  backContainer: {
    alignItems: 'center',
  },
  backLink: {
    ...typography.styles.bodyMedium,
  },
});

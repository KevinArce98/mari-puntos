import { useSignIn, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { handleClerkErrors } from '@/types/clerk-localization';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ControlledInput } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';
import { forgotPasswordSchema } from '@/validators/auth.schema';
import type { ForgotPasswordFormData } from '@/validators/auth.schema';
import logger from '@/utils/logger';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <Text style={styles.title}>Olvidé mi contraseña</Text>
            <Text style={styles.subtitle}>
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
              <Text style={styles.backLink}>Volver al inicio de sesión</Text>
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
    backgroundColor: colors.background,
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
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
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
    color: colors.primary,
  },
});

import { useSignIn, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { handleClerkErrors } from '@/types/clerk-localization';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ControlledCodeInput, ControlledInput } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';
import { resetPasswordSchema } from '@/validators/auth.schema';
import type { ResetPasswordFormData } from '@/validators/auth.schema';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  });

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
            <Text style={styles.title}>Restablecer contraseña</Text>
            <Text style={styles.subtitle}>
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

            <ControlledCodeInput
              control={control}
              name="code"
              length={6}
              type="numeric"
            />

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
              <Text style={styles.backLink}>Volver</Text>
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

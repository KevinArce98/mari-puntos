import { Button, ControlledCodeInput } from '@/components/ui';
import { userService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import { useSignUp, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { handleClerkErrors } from '@/types/clerk-localization';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  BackHandler,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyEmailSchema, type VerifyEmailFormData } from '@/validators/auth.schema';

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: '',
    },
  });

  const code = watch('code');

  // Prevent back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true to prevent default back behavior
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: VerifyEmailFormData) => {
    if (!isLoaded) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });
      if (result.status === 'complete') {
        const clerkId = result.createdUserId;
        try {
          await userService.createProfile({
            email,
            firstName: result.firstName || '',
            lastName: result.lastName || '',
            clerkId: clerkId ?? undefined,
          });

          // Now that profile exists in DB, activate the session
          await setActive({ session: result.createdSessionId });

          // Navigate to next step
          router.replace('/link-partner');
        } catch (profileError: any) {
          // Check if user already exists (409 conflict) - this is OK, continue
          if (profileError?.status === 409) {
            console.log('User profile already exists, continuing...');
            // Activate session and continue
            await setActive({ session: result.createdSessionId });
            router.replace('/link-partner');
          } else {
            // For other errors, show error and don't activate session
            Toast.show({
              type: 'error',
              text1: 'Error al crear perfil',
              text2: profileError?.message || 'Intenta iniciar sesión nuevamente',
            });
            return;
          }
        }
      }
    } catch (error: any) {
      let errorMessage = 'Código inválido';

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

  const handleResend = async () => {
    if (!isLoaded || !canResend) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Toast.show({
        type: 'success',
        text1: 'Código enviado',
        text2: 'Revisa tu correo electrónico',
      });
      // Reset cooldown
      setResendCooldown(60);
      setCanResend(false);
    } catch (error: any) {
      let errorMessage = 'No se pudo enviar el código';

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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Ionicons
              name="mail-outline"
              size={80}
              color={colors.primary}
              style={styles.icon}
            />
            <Text style={styles.title}>Verifica tu correo</Text>
            <Text style={styles.subtitle}>
              Hemos enviado un código de verificación a{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>

            <ControlledCodeInput
              control={control}
              name="code"
              length={6}
              type="numeric"
              style={styles.codeInput}
            />

            <Button
              title="Verificar"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              disabled={code.length !== 6}
              style={styles.verifyButton}
            />

            <Button
              title={
                canResend ? 'Reenviar código' : `Reenviar código (${resendCooldown}s)`
              }
              onPress={handleResend}
              variant="ghost"
              fullWidth
              disabled={!canResend}
            />
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  email: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
  },
  codeInput: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  verifyButton: {
    marginBottom: spacing.md,
  },
});

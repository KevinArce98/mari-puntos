import { Button, ControlledCodeInput } from '@/components/ui';
import { userService } from '@/services';
import { spacing, typography } from '@/theme';
import { useThemedColors } from '@/hooks';
import { useSignUp, isClerkAPIResponseError } from '@clerk/clerk-expo';
import logger from '@/utils/logger';
import { Ionicons } from '@expo/vector-icons';
import { handleClerkErrors } from '@/types/clerk-localization';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyEmailSchema, type VerifyEmailFormData } from '@/validators/auth.schema';

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();

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
            logger.info('User profile already exists, continuing...');
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

      logger.error('Email verification failed', error, { email, errorMessage });

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
      logger.info('Verification code resent', { email });
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

      logger.error('Failed to resend verification code', error, { email, errorMessage });

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
      behavior="padding"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Ionicons
              name="mail-outline"
              size={80}
              color={themeColors.primary}
              style={styles.icon}
            />
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              Verifica tu correo
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Hemos enviado un código de verificación a{'\n'}
              <Text style={[styles.email, { color: themeColors.primary }]}>{email}</Text>
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
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.body,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  email: {
    ...typography.styles.bodyMedium,
  },
  codeInput: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  verifyButton: {
    marginBottom: spacing.md,
  },
});

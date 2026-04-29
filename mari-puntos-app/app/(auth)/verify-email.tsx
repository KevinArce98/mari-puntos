import React, { useEffect, useState } from 'react';

import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { isClerkAPIResponseError, useAuth, useSignUp } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Button, ControlledCodeInput } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { apiService, userService } from '@/services';
import { spacing, typography } from '@/theme';
import { handleClerkErrors } from '@/types/clerk-localization';
import logger from '@/utils/logger';
import { type VerifyEmailFormData, verifyEmailSchema } from '@/validators/auth.schema';

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { signOut, getToken } = useAuth();
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

  // Intercept back button on Android — show confirmation so user isn't permanently trapped
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Cancelar verificación',
        '¿Seguro que deseas salir? Deberás verificar tu correo al iniciar sesión de nuevo.',
        [
          { text: 'Continuar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: () => router.back() },
        ]
      );
      return true; // Prevent default (we handle navigation via the alert)
    });
    return () => backHandler.remove();
  }, [router]);

  // Cooldown timer for resend button — setInterval is Strict Mode safe (no cascaded re-runs)
  useEffect(() => {
    if (canResend) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [canResend]);

  // Activate session, wire token getter, then create backend profile.
  // setActive must come first so getToken() returns a valid JWT for createProfile.
  const completeVerification = async (result: {
    status: string | null;
    createdUserId: string | null;
    firstName: string | null;
    lastName: string | null;
    createdSessionId: string | null;
  }) => {
    if (result.status !== 'complete') return;

    await setActive?.({ session: result.createdSessionId });

    // Pre-wire token getter immediately — useClerkAuth's useEffect won't have
    // re-run yet (React hasn't re-rendered), so fresh users would otherwise
    // send createProfile with no token and get a 401.
    apiService.setTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });

    try {
      await userService.createProfile({
        email,
        firstName: result.firstName || '',
        lastName: result.lastName || '',
        clerkId: result.createdUserId ?? undefined,
      });
      router.replace('/(tabs)');
    } catch (profileError: any) {
      if (profileError?.status === 409) {
        logger.info('User profile already exists, continuing...');
        router.replace('/(tabs)');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error al crear perfil',
          text2: profileError?.message || 'Intenta iniciar sesión nuevamente',
        });
      }
    }
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    if (!isLoaded) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: data.code });
      await completeVerification(result);
    } catch (error: any) {
      // If there's already an active session (e.g. previous sign-up completed but
      // profile creation failed), sign out and retry verification.
      if (isClerkAPIResponseError(error) && error.errors[0]?.code === 'session_exists') {
        logger.info('session_exists during verification — signing out and retrying', {
          email,
        });
        try {
          await signOut();
          const result = await signUp!.attemptEmailAddressVerification({
            code: data.code,
          });
          await completeVerification(result);
        } catch (retryError: any) {
          let retryMessage = 'Código inválido';
          if (isClerkAPIResponseError(retryError)) {
            retryMessage = handleClerkErrors(retryError.errors);
          }
          logger.error('Email verification failed after session sign-out', retryError, {
            email,
            errorMessage: retryMessage,
          });
          Toast.show({ type: 'error', text1: 'Error', text2: retryMessage });
        }
        return;
      }

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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

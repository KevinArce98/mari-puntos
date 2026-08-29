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
import * as Sentry from '@sentry/react-native';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { Button, ControlledCodeInput } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { apiService, userService } from '@/services';
import { useUserStore } from '@/stores';
import { spacing, typography } from '@/theme';
import { handleClerkErrors } from '@/types/clerk-localization';
import logger from '@/utils/logger';
import { type VerifyEmailFormData, verifyEmailSchema } from '@/validators/auth.schema';

const RECOVERABLE_VERIFICATION_CODES = [
  'verification_failed',
  'verification_expired',
  'client_state_invalid',
];

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen() {
  const { t } = useTranslation(['auth', 'errors']);
  const { signUp, setActive, isLoaded } = useSignUp();
  const { signOut, getToken } = useAuth();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();

  const { fetchProfile, setAuthTransitioning } = useUserStore();
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<VerifyEmailFormData>({
    mode: 'onBlur',
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: '',
    },
  });

  const code = useWatch({ control, name: 'code' });

  if (code.length > 0 && codeError) setCodeError(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        t('auth:verifyEmail.backPrompt.title'),
        t('auth:verifyEmail.backPrompt.message'),
        [
          { text: t('auth:verifyEmail.backPrompt.stay'), style: 'cancel' },
          {
            text: t('auth:verifyEmail.backPrompt.leave'),
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
      return true;
    });
    return () => backHandler.remove();
  }, [router, t]);

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

  const completeVerification = async (result: {
    status: string | null;
    createdUserId: string | null;
    firstName: string | null;
    lastName: string | null;
    createdSessionId: string | null;
  }) => {
    if (result.status !== 'complete') return;

    await setActive?.({ session: result.createdSessionId });

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
      logger.info('Email verified and profile created — awaiting AuthGuard redirect', {
        email,
      });
      await fetchProfile().catch(() => {});
    } catch (profileError: any) {
      if (profileError?.status === 409 || profileError?.status >= 500) {
        try {
          await fetchProfile();
          logger.info(
            'Email verified — profile confirmed after createProfile error, awaiting redirect',
            { email }
          );
          return;
        } catch {
          void 0;
        }
      }
      logger.error('Failed to create profile after email verification', profileError, {
        email,
      });
      toast.error(t('auth:verifyEmail.profileErrorTitle'), {
        description: profileError?.message || t('auth:verifyEmail.profileErrorMessage'),
      });
    }
  };

  const recoverWithNewCode = async (clerkCode: string) => {
    setValue('code', '');
    setCodeError(false);

    if (!signUp) {
      setCanResend(true);
      return;
    }

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      logger.info('Auto-resent verification code after recoverable error', {
        email,
        clerkCode,
      });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
      toast.info(t('auth:verifyEmail.newCodeTitle'), {
        description: t('auth:verifyEmail.newCodeMessage'),
      });
    } catch (resendError: any) {
      let resendMessage = t('auth:verifyEmail.resendFailed');
      if (isClerkAPIResponseError(resendError)) {
        resendMessage = handleClerkErrors(resendError.errors);
      }
      logger.error('Auto-resend after recoverable error failed', resendError, { email });
      setCanResend(true);
      toast.error(t('errors:title'), { description: resendMessage });
    }
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    if (!isLoaded) return;

    if (signUp?.id) Sentry.setUser({ id: signUp.id });

    logger.info('Email verification attempt', { email });
    setAuthTransitioning(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: data.code });
      await completeVerification(result);
    } catch (error: any) {
      const clerkCode = isClerkAPIResponseError(error)
        ? error.errors[0]?.code
        : undefined;

      if (clerkCode === 'session_exists') {
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
          const retryCode = isClerkAPIResponseError(retryError)
            ? retryError.errors[0]?.code
            : undefined;
          let retryMessage = t('auth:verifyEmail.invalidCode');
          if (isClerkAPIResponseError(retryError)) {
            retryMessage = handleClerkErrors(retryError.errors);
          }
          logger.error('Email verification failed after session sign-out', retryError, {
            email,
            errorMessage: retryMessage,
            clerkCode: retryCode,
          });
          if (retryCode && RECOVERABLE_VERIFICATION_CODES.includes(retryCode)) {
            await recoverWithNewCode(retryCode);
          } else {
            setCodeError(true);
            toast.error(t('errors:title'), { description: retryMessage });
          }
        }
        return;
      }

      let errorMessage = t('auth:verifyEmail.invalidCode');

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      logger.error('Email verification failed', error, {
        email,
        errorMessage,
        clerkCode,
      });

      if (clerkCode && RECOVERABLE_VERIFICATION_CODES.includes(clerkCode)) {
        await recoverWithNewCode(clerkCode);
      } else {
        setCodeError(true);
        toast.error(t('errors:title'), { description: errorMessage });
      }
    } finally {
      setAuthTransitioning(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !canResend) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setValue('code', '');
      setCodeError(false);
      logger.info('Verification code resent', { email });
      toast.success(t('auth:verifyEmail.sentTitle'), {
        description: t('auth:verifyEmail.sentMessage'),
      });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
    } catch (error: any) {
      let errorMessage = t('auth:verifyEmail.resendFailedShort');

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      logger.error('Failed to resend verification code', error, { email, errorMessage });

      toast.error(t('errors:title'), { description: errorMessage });
    }
  };

  const leaveVerification = (destination: '/(auth)/register' | '/(auth)/login') => {
    const changingEmail = destination === '/(auth)/register';
    Alert.alert(
      changingEmail
        ? t('auth:verifyEmail.leavePrompt.changeEmailTitle')
        : t('auth:verifyEmail.leavePrompt.cancelTitle'),
      changingEmail
        ? t('auth:verifyEmail.leavePrompt.changeEmailMessage')
        : t('auth:verifyEmail.leavePrompt.cancelMessage'),
      [
        { text: t('auth:verifyEmail.leavePrompt.stay'), style: 'cancel' },
        {
          text: changingEmail
            ? t('auth:verifyEmail.leavePrompt.changeEmailTitle')
            : t('auth:verifyEmail.leavePrompt.leave'),
          style: changingEmail ? 'default' : 'destructive',
          onPress: async () => {
            await signOut().catch(() => {});
            router.replace(destination);
          },
        },
      ]
    );
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
              {t('auth:verifyEmail.title')}
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              {t('auth:verifyEmail.subtitle')}
              {'\n'}
              <Text style={[styles.email, { color: themeColors.primary }]}>{email}</Text>
            </Text>

            <ControlledCodeInput
              control={control}
              name="code"
              length={6}
              type="numeric"
              error={codeError}
              style={styles.codeInput}
            />

            <Button
              title={t('auth:verifyEmail.submit')}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              disabled={code.length !== 6}
              style={styles.verifyButton}
            />

            <Button
              title={
                canResend
                  ? t('auth:verifyEmail.resend')
                  : t('auth:verifyEmail.resendCountdown', { seconds: resendCooldown })
              }
              onPress={handleResend}
              variant="ghost"
              fullWidth
              disabled={!canResend}
            />

            <View style={styles.exitActions}>
              <Button
                title={t('auth:verifyEmail.changeEmail')}
                onPress={() => leaveVerification('/(auth)/register')}
                variant="ghost"
                fullWidth
              />
              <Button
                title={t('auth:verifyEmail.cancelRegistration')}
                onPress={() => leaveVerification('/(auth)/login')}
                variant="ghost"
                fullWidth
                textStyle={{ color: themeColors.text.secondary }}
              />
            </View>
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
  exitActions: {
    width: '100%',
    marginTop: spacing.sm,
  },
});

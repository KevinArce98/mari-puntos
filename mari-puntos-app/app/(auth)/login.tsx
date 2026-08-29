import React, { useState } from 'react';

import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { isClerkAPIResponseError, useAuth } from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { Button, ControlledInput, PressableScale } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';
import { handleClerkErrors } from '@/types/clerk-localization';
import logger from '@/utils/logger';
import { type LoginFormData, loginSchema } from '@/validators/auth.schema';

export default function LoginScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const attemptSignIn = async (data: LoginFormData) => {
    const result = await signIn!.create({
      identifier: data.email,
      password: data.password,
    });

    if (result.status === 'complete') {
      await setActive!({ session: result.createdSessionId });
      logger.info('User logged in successfully — awaiting AuthGuard redirect', {
        email: data.email,
      });
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    if (!isLoaded) return;

    logger.info('Login attempt', { email: data.email });
    try {
      await attemptSignIn(data);
    } catch (error: any) {
      if (isClerkAPIResponseError(error) && error.errors[0]?.code === 'session_exists') {
        logger.info('session_exists during login — signing out and retrying', {
          email: data.email,
        });
        try {
          await signOut();
          await attemptSignIn(data);
        } catch (retryError: any) {
          let retryMessage = t('login.invalidCredentials');
          if (isClerkAPIResponseError(retryError)) {
            retryMessage = handleClerkErrors(retryError.errors);
          }
          logger.warn('Login failed after session sign-out', {
            email: data.email,
            error: retryMessage,
          });
          toast.error(t('login.failedTitle'), { description: retryMessage });
        }
        return;
      }

      let errorMessage = t('login.invalidCredentials');

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      logger.warn('Login failed', { email: data.email, error: errorMessage });

      toast.error(t('login.failedTitle'), { description: errorMessage });
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
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              {t('login.title')}
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              {t('login.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="email"
              label={t('fields.email')}
              placeholder={t('fields.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <ControlledInput
              control={control}
              name="password"
              label={t('fields.password')}
              placeholder={t('fields.passwordPlaceholder')}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <PressableScale
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>
                {t('login.forgotPassword')}
              </Text>
            </PressableScale>

            <Button
              title={t('login.submit')}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
            />
          </View>

          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: themeColors.text.secondary }]}>
              {t('login.noAccount')}
            </Text>
            <PressableScale onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.registerLink, { color: themeColors.primary }]}>
                {t('login.registerLink')}
              </Text>
            </PressableScale>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    ...typography.styles.bodyMedium,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    ...typography.styles.body,
  },
  registerLink: {
    ...typography.styles.bodyMedium,
  },
});

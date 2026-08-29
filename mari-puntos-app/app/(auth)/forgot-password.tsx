import React from 'react';

import {
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

import { isClerkAPIResponseError } from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { Button, ControlledInput, PressableScale } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { handleClerkErrors } from '@/types/clerk-localization';
import logger from '@/utils/logger';
import { forgotPasswordSchema } from '@/validators/auth.schema';
import type { ForgotPasswordFormData } from '@/validators/auth.schema';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation(['auth', 'errors']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { signIn, isLoaded } = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    mode: 'onBlur',
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
        router.push({
          pathname: '/(auth)/reset-password',
          params: { email: data.email },
        });
      }
    } catch (error: any) {
      let errorMessage = t('auth:forgotPassword.failed');

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      logger.error('Failed to send password reset email', error, {
        email: data.email,
        errorMessage,
      });

      toast.error(t('errors:title'), { description: errorMessage });
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
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              {t('auth:forgotPassword.title')}
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              {t('auth:forgotPassword.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="email"
              label={t('auth:fields.email')}
              placeholder={t('auth:fields.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Button
              title={t('auth:forgotPassword.submit')}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
            />
          </View>

          <View style={styles.backContainer}>
            <PressableScale onPress={() => router.back()}>
              <Text style={[styles.backLink, { color: themeColors.primary }]}>
                {t('auth:forgotPassword.backToLogin')}
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

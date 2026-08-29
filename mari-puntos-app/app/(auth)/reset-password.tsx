import React, { useState } from 'react';

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

import { useLocalSearchParams, useRouter } from 'expo-router';

import { isClerkAPIResponseError } from '@clerk/expo';
import { useSignIn } from '@clerk/expo/legacy';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  Button,
  ControlledCodeInput,
  ControlledInput,
  PressableScale,
} from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { handleClerkErrors } from '@/types/clerk-localization';
import { resetPasswordSchema } from '@/validators/auth.schema';
import type { ResetPasswordFormData } from '@/validators/auth.schema';
import { hasPasswordSymbol } from '@/validators/password.rules';

export default function ResetPasswordScreen() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
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
    mode: 'onBlur',
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
      const attemptResult = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: data.code,
      });

      if (attemptResult.status === 'needs_new_password') {
        const resetResult = await signIn.resetPassword({
          password: data.password,
        });

        if (resetResult.status === 'complete') {
          await setActive({ session: resetResult.createdSessionId });
          router.replace('/(tabs)');
          toast.success(t('auth:resetPassword.successTitle'), {
            description: t('auth:resetPassword.successMessage'),
          });
        }
      }
    } catch (error: any) {
      let errorMessage = t('auth:resetPassword.failed');

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

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
              {t('auth:resetPassword.title')}
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              {t('auth:resetPassword.subtitle', { email })}
            </Text>
          </View>

          <View style={styles.form}>
            <ControlledInput
              control={control}
              name="password"
              label={t('auth:fields.newPassword')}
              placeholder={t('auth:fields.newPasswordPlaceholder')}
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
              {t('auth:resetPassword.symbolRule')}
            </Text>

            <ControlledInput
              control={control}
              name="confirmPassword"
              label={t('auth:fields.confirmPassword')}
              placeholder={t('auth:fields.confirmNewPasswordPlaceholder')}
              secureTextEntry={!showConfirmPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <View style={styles.codeInputContainer}>
              <Text style={[styles.codeLabel, { color: themeColors.text.primary }]}>
                {t('auth:fields.verificationCode')}
              </Text>
              <ControlledCodeInput
                control={control}
                name="code"
                length={6}
                type="numeric"
              />
            </View>

            <Button
              title={t('auth:resetPassword.submit')}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
            />
          </View>

          <View style={styles.backContainer}>
            <PressableScale onPress={() => router.back()}>
              <Text style={[styles.backLink, { color: themeColors.primary }]}>
                {t('common:actions.goBack')}
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

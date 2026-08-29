import React, { useState } from 'react';

import {
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { isClerkAPIResponseError } from '@clerk/expo';
import { useSignUp } from '@clerk/expo/legacy';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { Button, ControlledInput, PressableScale } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';
import { handleClerkErrors } from '@/types/clerk-localization';
import logger from '@/utils/logger';
import { type RegisterFormData, registerSchema } from '@/validators/auth.schema';
import {
  hasPasswordLowercase,
  hasPasswordNumber,
  hasPasswordSymbol,
  hasPasswordUppercase,
} from '@/validators/password.rules';

export default function RegisterScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { signUp, isLoaded } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    mode: 'onBlur',
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = useWatch({ control, name: 'password' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword' });

  const hasMinLength = password.length >= 8;
  const hasLowercase = hasPasswordLowercase(password);
  const hasUppercase = hasPasswordUppercase(password);
  const hasNumber = hasPasswordNumber(password);
  const hasSymbol = hasPasswordSymbol(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const onSubmit = async (data: RegisterFormData) => {
    if (!isLoaded) return;

    logger.info('Registration attempt', { email: data.email });
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName || undefined,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      logger.info('User registration initiated', {
        email: data.email,
        firstName: data.firstName,
      });

      toast.success(t('register.createdTitle'), {
        description: t('register.createdMessage'),
      });

      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: data.email },
      });
    } catch (error: any) {
      let errorMessage = t('register.failedMessage');

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      logger.error('User registration failed', error, {
        email: data.email,
        errorMessage,
      });

      toast.error(t('register.failedTitle'), { description: errorMessage });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: themeColors.background, paddingTop: insets.top },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PressableScale style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
          </PressableScale>

          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              {t('register.title')}
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              {t('register.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <ControlledInput
                control={control}
                name="firstName"
                label={t('fields.firstName')}
                placeholder={t('fields.firstNamePlaceholder')}
                containerStyle={styles.nameInput}
                leftIcon="person-outline"
              />
              <ControlledInput
                control={control}
                name="lastName"
                label={t('fields.lastName')}
                placeholder={t('fields.lastNamePlaceholder')}
                containerStyle={styles.nameInput}
              />
            </View>

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
              placeholder={t('fields.minCharsPlaceholder')}
              autoComplete="off"
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <ControlledInput
              control={control}
              name="confirmPassword"
              label={t('fields.confirmPassword')}
              autoComplete="off"
              placeholder={t('fields.confirmPasswordPlaceholder')}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
            />

            <View style={styles.requirements}>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasMinLength ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={hasMinLength ? themeColors.success : themeColors.gray[400]}
                />
                <Text
                  style={[
                    styles.requirementText,
                    {
                      color: hasMinLength
                        ? themeColors.success
                        : themeColors.text.secondary,
                    },
                  ]}
                >
                  {t('register.requirements.minLength')}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasLowercase ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={hasLowercase ? themeColors.success : themeColors.gray[400]}
                />
                <Text
                  style={[
                    styles.requirementText,
                    {
                      color: hasLowercase
                        ? themeColors.success
                        : themeColors.text.secondary,
                    },
                  ]}
                >
                  {t('register.requirements.lowercase')}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasUppercase ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={hasUppercase ? themeColors.success : themeColors.gray[400]}
                />
                <Text
                  style={[
                    styles.requirementText,
                    {
                      color: hasUppercase
                        ? themeColors.success
                        : themeColors.text.secondary,
                    },
                  ]}
                >
                  {t('register.requirements.uppercase')}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={hasNumber ? themeColors.success : themeColors.gray[400]}
                />
                <Text
                  style={[
                    styles.requirementText,
                    {
                      color: hasNumber ? themeColors.success : themeColors.text.secondary,
                    },
                  ]}
                >
                  {t('register.requirements.number')}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasSymbol ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={hasSymbol ? themeColors.success : themeColors.gray[400]}
                />
                <Text
                  style={[
                    styles.requirementText,
                    {
                      color: hasSymbol ? themeColors.success : themeColors.text.secondary,
                    },
                  ]}
                >
                  {t('register.requirements.symbol')}
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={passwordsMatch ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={passwordsMatch ? themeColors.success : themeColors.gray[400]}
                />
                <Text
                  style={[
                    styles.requirementText,
                    {
                      color: passwordsMatch
                        ? themeColors.success
                        : themeColors.text.secondary,
                    },
                  ]}
                >
                  {t('register.requirements.match')}
                </Text>
              </View>
            </View>

            <PressableScale
              style={styles.termsRow}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: termsAccepted
                      ? themeColors.primary
                      : themeColors.gray[400],
                    backgroundColor: termsAccepted ? themeColors.primary : 'transparent',
                  },
                ]}
              >
                {termsAccepted && (
                  <Ionicons name="checkmark" size={12} color={themeColors.background} />
                )}
              </View>
              <Text style={[styles.termsText, { color: themeColors.text.secondary }]}>
                {t('register.terms.prefix')}
                <Text
                  style={{ color: themeColors.primary }}
                  onPress={() => Linking.openURL('https://maripuntos.com/terminos')}
                >
                  {t('register.terms.termsLink')}
                </Text>
                {t('register.terms.connector')}
                <Text
                  style={{ color: themeColors.primary }}
                  onPress={() => Linking.openURL('https://maripuntos.com/privacidad')}
                >
                  {t('register.terms.privacyLink')}
                </Text>
              </Text>
            </PressableScale>

            <Button
              title={t('register.submit')}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={!termsAccepted}
              fullWidth
              size="lg"
              icon="person-add-outline"
            />
          </View>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: themeColors.text.secondary }]}>
              {t('register.haveAccount')}
            </Text>
            <PressableScale onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.loginLink, { color: themeColors.primary }]}>
                {t('register.loginLink')}
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
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
  },
  form: {
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  requirements: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementText: {
    ...typography.styles.caption,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...typography.styles.body,
  },
  loginLink: {
    ...typography.styles.bodyMedium,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  termsText: {
    ...typography.styles.caption,
    flex: 1,
    lineHeight: 20,
  },
});

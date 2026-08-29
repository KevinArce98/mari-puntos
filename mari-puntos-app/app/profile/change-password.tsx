import React, { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useNavigation, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';

import { Ionicons } from '@expo/vector-icons';

import { useUser } from '@clerk/expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { z } from 'zod';

import { Button, PressableScale } from '@/components/ui';
import { ControlledInput } from '@/components/ui/ControlledInput';
import { useThemedColors } from '@/hooks';
import i18n from '@/i18n';
import { spacing, typography } from '@/theme';
import { hasPasswordSymbol, passwordSchema } from '@/validators/password.rules';

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: () => i18n.t('validation:password.currentRequired') }),
    newPassword: passwordSchema,
    confirmNewPassword: z
      .string()
      .min(1, { error: () => i18n.t('validation:password.confirmNewRequired') }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    error: () => i18n.t('validation:password.mismatch'),
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordScreen() {
  const { t } = useTranslation(['profile', 'errors']);
  const colors = useThemedColors();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [allowExit, setAllowExit] = useState(false);

  const hasPasswordAuth = isLoaded
    ? user?.externalAccounts?.length === 0 || user?.passwordEnabled
    : true;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ChangePasswordFormData>({
    mode: 'onBlur',
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = useWatch({ control, name: 'newPassword' });
  const hasSymbol = hasPasswordSymbol(newPassword);

  usePreventRemove(isDirty && !allowExit, ({ data }) => {
    Alert.alert(t('changePassword.discard.title'), t('changePassword.discard.message'), [
      { text: t('changePassword.discard.stay'), style: 'cancel' },
      {
        text: t('changePassword.discard.confirm'),
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await user.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      toast.success(t('changePassword.successTitle'), {
        description: t('changePassword.successMessage'),
      });
      setAllowExit(true);
      setTimeout(() => router.back(), 0);
    } catch (error: any) {
      const message =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        t('changePassword.errorMessage');
      toast.error(t('errors:title'), { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('changePassword.backA11y')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </PressableScale>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t('changePassword.title')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {!hasPasswordAuth ? (
        <View style={styles.noPasswordContainer}>
          <Ionicons name="logo-google" size={48} color={colors.gray[400]} />
          <Text style={[styles.noPasswordTitle, { color: colors.text.primary }]}>
            {t('changePassword.externalTitle')}
          </Text>
          <Text style={[styles.noPasswordText, { color: colors.text.secondary }]}>
            {t('changePassword.externalText')}
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ControlledInput
              control={control}
              name="currentPassword"
              label={t('changePassword.currentLabel')}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />
            <ControlledInput
              control={control}
              name="newPassword"
              label={t('changePassword.newLabel')}
              secureTextEntry
              leftIcon="lock-open-outline"
            />
            <Text
              style={[
                styles.passwordRule,
                { color: hasSymbol ? colors.success : colors.text.secondary },
              ]}
            >
              {t('changePassword.symbolRule')}
            </Text>
            <ControlledInput
              control={control}
              name="confirmNewPassword"
              label={t('changePassword.confirmLabel')}
              secureTextEntry
              leftIcon="checkmark-circle-outline"
            />

            <Button
              title={t('changePassword.submit')}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              icon="checkmark"
              style={styles.submitButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.styles.h3,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  submitButton: {
    marginTop: spacing.md,
  },
  passwordRule: {
    ...typography.styles.caption,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  noPasswordContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  noPasswordTitle: {
    ...typography.styles.h3,
    textAlign: 'center',
  },
  noPasswordText: {
    ...typography.styles.body,
    textAlign: 'center',
  },
});

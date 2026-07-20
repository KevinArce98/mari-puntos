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

import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { signUp, isLoaded } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
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

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Password validation helpers
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

      // Send verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      logger.info('User registration initiated', {
        email: data.email,
        firstName: data.firstName,
      });

      toast.success('¡Cuenta creada!', {
        description: 'Revisa tu correo para el código de verificación',
      });

      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: data.email },
      });
    } catch (error: any) {
      let errorMessage = 'No se pudo crear la cuenta. Por favor intenta de nuevo.';

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      logger.error('User registration failed', error, {
        email: data.email,
        errorMessage,
      });

      toast.error('Registro fallido', { description: errorMessage });
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
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <PressableScale style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
          </PressableScale>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              Crear cuenta
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Únete a MariPuntos y comienza a ganar puntos con tu pareja
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <ControlledInput
                control={control}
                name="firstName"
                label="Nombre"
                placeholder="Juan"
                containerStyle={styles.nameInput}
                leftIcon="person-outline"
              />
              <ControlledInput
                control={control}
                name="lastName"
                label="Apellido"
                placeholder="Pérez"
                containerStyle={styles.nameInput}
              />
            </View>

            <ControlledInput
              control={control}
              name="email"
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <ControlledInput
              control={control}
              name="password"
              label="Contraseña"
              placeholder="Mín. 8 caracteres"
              autoComplete="off"
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <ControlledInput
              control={control}
              name="confirmPassword"
              label="Confirmar contraseña"
              autoComplete="off"
              placeholder="Repite tu contraseña"
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
            />

            {/* Password Requirements */}
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
                  Al menos 8 caracteres
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
                  Una letra minúscula (a-z)
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
                  Una letra mayúscula (A-Z)
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
                  Un número (0-9)
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
                  Un símbolo (ej. !@#$)
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
                  Las contraseñas coinciden
                </Text>
              </View>
            </View>

            {/* Terms & Privacy acceptance */}
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
                Acepto los{' '}
                <Text
                  style={{ color: themeColors.primary }}
                  onPress={() => Linking.openURL('https://maripuntos.com/terminos')}
                >
                  Términos de Servicio
                </Text>{' '}
                y la{' '}
                <Text
                  style={{ color: themeColors.primary }}
                  onPress={() => Linking.openURL('https://maripuntos.com/privacidad')}
                >
                  Política de Privacidad
                </Text>
              </Text>
            </PressableScale>

            <Button
              title="Crear cuenta"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={!termsAccepted}
              fullWidth
              size="lg"
              icon="person-add-outline"
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: themeColors.text.secondary }]}>
              ¿Ya tienes una cuenta?{' '}
            </Text>
            <PressableScale onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.loginLink, { color: themeColors.primary }]}>
                Inicia sesión
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

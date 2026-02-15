import { useSignUp, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ControlledInput } from '@/components/ui';
import { handleClerkErrors } from '@/types/clerk-localization';
import { borderRadius, colors, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';
import { registerSchema, type RegisterFormData } from '@/validators/auth.schema';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, isLoaded } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
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
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const onSubmit = async (data: RegisterFormData) => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName || undefined,
      });

      // Send verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      Toast.show({
        type: 'success',
        text1: '¡Cuenta creada!',
        text2: 'Revisa tu correo para el código de verificación',
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

      Toast.show({
        type: 'error',
        text1: 'Registro fallido',
        text2: errorMessage,
      });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
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
                  color={hasMinLength ? colors.success : colors.gray[400]}
                />
                <Text
                  style={[styles.requirementText, hasMinLength && styles.requirementMet]}
                >
                  Al menos 8 caracteres
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasLowercase ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={hasLowercase ? colors.success : colors.gray[400]}
                />
                <Text
                  style={[styles.requirementText, hasLowercase && styles.requirementMet]}
                >
                  Una letra minúscula (a-z)
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasUppercase ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={hasUppercase ? colors.success : colors.gray[400]}
                />
                <Text
                  style={[styles.requirementText, hasUppercase && styles.requirementMet]}
                >
                  Una letra mayúscula (A-Z)
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={hasNumber ? colors.success : colors.gray[400]}
                />
                <Text
                  style={[styles.requirementText, hasNumber && styles.requirementMet]}
                >
                  Un número (0-9)
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={passwordsMatch ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={passwordsMatch ? colors.success : colors.gray[400]}
                />
                <Text
                  style={[
                    styles.requirementText,
                    passwordsMatch && styles.requirementMet,
                  ]}
                >
                  Las contraseñas coinciden
                </Text>
              </View>
            </View>

            <Button
              title="Crear cuenta"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
              icon="person-add-outline"
            />
          </View>

          {/* Divider */}
          {/* <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o regístrate con</Text>
          <View style={styles.dividerLine} />
        </View> */}

          {/* Social Buttons */}
          {/* <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View> */}

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
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
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
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
    color: colors.gray[400],
  },
  requirementMet: {
    color: colors.success,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
  },
  dividerText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  loginLink: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
  },
});

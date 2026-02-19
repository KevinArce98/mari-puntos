import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSignIn, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { handleClerkErrors } from '@/types/clerk-localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ControlledInput } from '@/components/ui';
import { borderRadius, colors, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';
import { useThemedColors } from '@/hooks';
import { loginSchema, type LoginFormData } from '@/validators/auth.schema';
import logger from '@/utils/logger';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        logger.info('User logged in successfully', { email: data.email });
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      let errorMessage = 'Correo o contraseña inválidos';

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      logger.warn('Login failed', { email: data.email, error: errorMessage });

      Toast.show({
        type: 'error',
        text1: 'Inicio de sesión fallido',
        text2: errorMessage,
      });
    }
  };

  // const handleGoogleLogin = async () => {
  //   try {
  //     const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();
  //     if (createdSessionId && setOAuthActive) {
  //       await setOAuthActive({ session: createdSessionId });
  //       router.replace('/(tabs)');
  //     }
  //   } catch {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: 'Could not sign in with Google',
  //     });
  //   }
  // };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>
              ¡Bienvenido de nuevo!
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Inicia sesión para continuar ganando puntos con tu pareja
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
              placeholder="Ingresa tu contraseña"
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <Button
              title="Iniciar sesión"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              size="lg"
            />
          </View>

          {/* Divider */}
          {/* <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View> */}

          {/* Social Login */}
          {/* <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={24} color={themeColors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={24} color={themeColors.text.primary} />
          </TouchableOpacity>
        </View> */}

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: themeColors.text.secondary }]}>
              {'¿No tienes una cuenta? '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.registerLink, { color: themeColors.primary }]}>
                Regístrate
              </Text>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.light.gray[300],
  },
  dividerText: {
    ...typography.styles.caption,
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
    backgroundColor: colors.light.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.gray[200],
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

import { useSignUp, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { handleClerkErrors } from '@/types/clerk-localization';
import { borderRadius, colors, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, isLoaded } = useSignUp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!isLoaded) return;

    // Validations
    if (!firstName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo faltante',
        text2: 'Por favor ingresa tu nombre',
      });
      return;
    }

    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo faltante',
        text2: 'Por favor ingresa tu correo electrónico',
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Contraseña débil',
        text2: 'La contraseña debe tener al menos 8 caracteres',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Las contraseñas no coinciden',
        text2: 'Las contraseñas no son iguales',
      });
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email.toLowerCase().trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
      });

      // Send verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      Toast.show({
        type: 'success',
        text1: '¡Cuenta creada!',
        text2: 'Revisa tu correo para el código de verificación',
      });

      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.toLowerCase().trim() },
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              <Input
                label="Nombre"
                placeholder="Juan"
                value={firstName}
                onChangeText={setFirstName}
                containerStyle={styles.nameInput}
                leftIcon="person-outline"
              />
              <Input
                label="Apellido"
                placeholder="Pérez"
                value={lastName}
                onChangeText={setLastName}
                containerStyle={styles.nameInput}
              />
            </View>

            <Input
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Contraseña"
              placeholder="Mín. 8 caracteres"
              value={password}
              autoComplete="off"
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Input
              label="Confirmar contraseña"
              autoComplete="off"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
            />

            {/* Password Requirements */}
            <View style={styles.requirements}>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={password.length >= 8 ? colors.success : colors.gray[400]}
                />
                <Text
                  style={[
                    styles.requirementText,
                    password.length >= 8 && styles.requirementMet,
                  ]}
                >
                  Al menos 8 caracteres
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={
                    password === confirmPassword && password.length > 0
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={16}
                  color={
                    password === confirmPassword && password.length > 0
                      ? colors.success
                      : colors.gray[400]
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    password === confirmPassword &&
                      password.length > 0 &&
                      styles.requirementMet,
                  ]}
                >
                  Las contraseñas coinciden
                </Text>
              </View>
            </View>

            <Button
              title="Crear cuenta"
              onPress={handleRegister}
              loading={loading}
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

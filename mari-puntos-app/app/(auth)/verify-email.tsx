import { Button, Input } from '@/components/ui';
import { userService } from '@/services';
import { colors, spacing, typography } from '@/theme';
import { useSignUp, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { handleClerkErrors } from '@/types/clerk-localization';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  BackHandler,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60); // Start with 60 seconds cooldown
  const [canResend, setCanResend] = useState(false);

  // Prevent back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true to prevent default back behavior
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === 'complete') {
        // First, activate the session to ensure we have a valid token
        await setActive({ session: result.createdSessionId });

        // Add a small delay to ensure session is fully active
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Now create the profile with an authenticated token
        // clerkId is obtained from the token on the backend, not sent in body
        try {
          await userService.createProfile({
            email,
            firstName: result.firstName || '',
            lastName: result.lastName || '',
          });
        } catch (profileError: any) {
          console.error('Error creating profile:', profileError);

          // Check if user already exists (409 conflict) - this is OK, continue
          if (profileError?.status === 409) {
            console.log('User profile already exists, continuing...');
          } else {
            // For other errors, show a warning but still continue
            // The profile will be fetched/created on next app launch via auth guard
            Toast.show({
              type: 'info',
              text1: 'Perfil creado',
              text2: 'Configura tu cuenta para continuar',
            });
          }
        }

        router.replace('/link-partner');
      }
    } catch (error: any) {
      let errorMessage = 'Código inválido';

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !canResend) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Toast.show({
        type: 'success',
        text1: 'Código enviado',
        text2: 'Revisa tu correo electrónico',
      });
      // Reset cooldown
      setResendCooldown(60);
      setCanResend(false);
    } catch (error: any) {
      let errorMessage = 'No se pudo enviar el código';

      if (isClerkAPIResponseError(error)) {
        errorMessage = handleClerkErrors(error.errors);
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.icon}>📧</Text>
            <Text style={styles.title}>Verifica tu correo</Text>
            <Text style={styles.subtitle}>
              Hemos enviado un código de verificación a{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>

            <Input
              label="Código de verificación"
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              containerStyle={styles.input}
            />

            <Button
              title="Verificar"
              onPress={handleVerify}
              loading={loading}
              fullWidth
              disabled={code.length !== 6}
              style={styles.verifyButton}
            />

            <Button
              title={
                canResend ? 'Reenviar código' : `Reenviar código (${resendCooldown}s)`
              }
              onPress={handleResend}
              variant="ghost"
              fullWidth
              disabled={!canResend}
            />
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  email: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
  },
  input: {
    width: '100%',
    marginBottom: spacing.md,
  },
  verifyButton: {
    marginBottom: spacing.md,
  },
});

import { Button, Card, CodeInput } from '@/components/ui';
import { useUser } from '@/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function LinkPartnerScreen() {
  const router = useRouter();
  const {
    joinPartnerLink,
    createPartnerLink,
    getPartnerLinkCode,
    fetchPartnerInfo,
    refetch,
  } = useUser();

  const [partnerCode, setPartnerCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingExistingCode, setLoadingExistingCode] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load existing partner link code on mount
  useEffect(() => {
    const loadExistingCode = async () => {
      try {
        const existingLink = await getPartnerLinkCode();
        if (existingLink && existingLink.status === 'pending') {
          setGeneratedCode(existingLink.linkCode);
        }
      } catch (error) {
        console.error('Error loading existing code:', error);
      } finally {
        setLoadingExistingCode(false);
      }
    };

    loadExistingCode();
  }, []);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const code = await createPartnerLink();
      setGeneratedCode(code);
      Toast.show({
        type: 'success',
        text1: '¡Código generado!',
        text2: 'Comparte este código con tu pareja',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (error as any)?.error
          ? (error as any).error
          : 'No se pudo generar el código',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await Clipboard.setStringAsync(generatedCode);
      Toast.show({
        type: 'success',
        text1: '¡Copiado!',
        text2: 'Código copiado al portapapeles',
      });
    }
  };

  const handleLinkAccounts = async () => {
    if (partnerCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Código inválido',
        text2: 'Por favor ingresa un código de 6 caracteres',
      });
      return;
    }

    setLoading(true);
    try {
      await joinPartnerLink(partnerCode);
      Toast.show({
        type: 'success',
        text1: '¡Vinculado!',
        text2: 'Ahora estás conectado con tu pareja',
      });
      router.replace('/(tabs)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (error as any)?.error
          ? (error as any).error
          : 'Código inválido o expirado',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLink = async () => {
    setRefreshing(true);
    try {
      // Check if partner has joined by fetching partner info
      const partnerInfo = await fetchPartnerInfo();

      if (partnerInfo) {
        // Partner has joined successfully - refresh user profile
        await refetch();

        Toast.show({
          type: 'success',
          text1: '¡Vinculado exitosamente!',
          text2: `Tu pareja ${partnerInfo.partner.firstName} se ha conectado`,
        });

        // Redirect to home after a brief delay to show the toast
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      } else {
        Toast.show({
          type: 'info',
          text1: 'Esperando conexión',
          text2: 'Tu pareja aún no ha ingresado el código',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'info',
        text1: 'Esperando conexión',
        text2: 'Tu pareja aún no ha ingresado el código',
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Puzzle Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.puzzleIcon}>
              <Ionicons name="extension-puzzle" size={80} color={colors.primary} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>¡Conectémonos!</Text>
          <Text style={styles.subtitle}>
            Conéctate con tu pareja para comenzar tu viaje en MariPuntos juntos
          </Text>

          {/* Your Unique Code Section */}
          <Card style={styles.codeSection}>
            <Text style={styles.sectionLabel}>Tu código único</Text>

            {loadingExistingCode ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Verificando código...</Text>
              </View>
            ) : generatedCode ? (
              <View style={styles.generatedCodeContainer}>
                <Text style={styles.generatedCode}>{generatedCode}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                  <Ionicons name="copy-outline" size={20} color={colors.primary} />
                  <Text style={styles.copyText}>Copiar código</Text>
                </TouchableOpacity>

                {/* Refresh button */}
                <Button
                  title="Verificar vinculación"
                  onPress={handleRefreshLink}
                  loading={refreshing}
                  variant="outline"
                  fullWidth
                  icon="refresh-outline"
                  style={styles.refreshButton}
                />
                <Text style={styles.refreshHint}>
                  Toca aquí después de que tu pareja ingrese el código
                </Text>
              </View>
            ) : (
              <Button
                title="Generar código"
                onPress={handleGenerateCode}
                loading={generating}
                variant="outline"
                fullWidth
                icon="refresh-outline"
              />
            )}
          </Card>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Enter Partner Code Section */}
          <Card style={styles.codeSection}>
            <Text style={styles.sectionLabel}>Ingresa el código de tu pareja</Text>
            <CodeInput value={partnerCode} onChangeText={setPartnerCode} length={6} />
          </Card>

          {/* Link Button */}
          <Button
            title="Vincular cuentas"
            onPress={handleLinkAccounts}
            loading={loading}
            fullWidth
            disabled={partnerCode.length !== 6}
            style={styles.linkButton}
            icon="link"
          />

          {/* Skip Link */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipText}>Regresar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  puzzleIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.styles.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  codeSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.styles.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  generatedCodeContainer: {
    alignItems: 'center',
  },
  generatedCode: {
    ...typography.styles.h1,
    color: colors.primary,
    letterSpacing: 8,
    marginBottom: spacing.md,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  copyText: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
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
    ...typography.styles.bodyMedium,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  linkButton: {
    marginTop: spacing.lg,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  skipText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  refreshButton: {
    marginTop: spacing.lg,
  },
  refreshHint: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

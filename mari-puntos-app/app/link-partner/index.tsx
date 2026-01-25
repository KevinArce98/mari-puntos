import { Button, Card, CodeInput } from '@/components/ui';
import { useUser } from '@/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';
import { UserRole } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function LinkPartnerScreen() {
  const router = useRouter();
  const { joinPartnerLink, createPartnerLink, user } = useUser();

  const [partnerCode, setPartnerCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const code = await createPartnerLink(user?.role as UserRole);
      setGeneratedCode(code);
      Toast.show({
        type: 'success',
        text1: 'Code Generated!',
        text2: 'Share this code with your partner',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not generate code',
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
        text1: 'Copied!',
        text2: 'Code copied to clipboard',
      });
    }
  };

  const handleLinkAccounts = async () => {
    if (partnerCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter a 6-character code',
      });
      return;
    }

    setLoading(true);
    try {
      await joinPartnerLink(partnerCode);
      Toast.show({
        type: 'success',
        text1: 'Linked!',
        text2: 'You are now connected with your partner',
      });
      router.replace('/(tabs)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid or expired code',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Puzzle Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.puzzleIcon}>
            <Ionicons name="extension-puzzle" size={80} color={colors.primary} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Let's Link Up!</Text>
        <Text style={styles.subtitle}>
          Connect with your partner to start your MariPuntos journey together
        </Text>

        {/* Your Unique Code Section */}
        <Card style={styles.codeSection}>
          <Text style={styles.sectionLabel}>Your Unique Code</Text>
          
          {generatedCode ? (
            <View style={styles.generatedCodeContainer}>
              <Text style={styles.generatedCode}>{generatedCode}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                <Text style={styles.copyText}>Copy Code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title="Generate Code"
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
          <Text style={styles.sectionLabel}>Enter Partner's Code</Text>
          <CodeInput
            value={partnerCode}
            onChangeText={setPartnerCode}
            length={6}
          />
        </Card>

        {/* Link Button */}
        <Button
          title="Link Accounts"
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
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
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
});

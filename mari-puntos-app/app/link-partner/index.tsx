import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { Button, Card, CodeInput, PressableScale } from '@/components/ui';
import { useThemedColors, useUser } from '@/hooks';
import { userService } from '@/services';
import {
  useActionsStore,
  usePermissionsStore,
  usePointsStore,
  useStreakStore,
  useUserStore,
} from '@/stores';
import { borderRadius, spacing, typography } from '@/theme';
import logger from '@/utils/logger';
import { LinkPartnerFormData, linkPartnerSchema } from '@/validators';

export default function LinkPartnerScreen() {
  const { t } = useTranslation(['linkPartner', 'errors']);
  const themeColors = useThemedColors();
  const router = useRouter();
  const { joinPartnerLink, createPartnerLink, getPartnerLinkCode } = useUser();

  const [generatedCode, setGeneratedCode] = useState('');
  const [linkMode, setLinkMode] = useState<'share' | 'join'>('share');
  const [generating, setGenerating] = useState(false);
  const [loadingExistingCode, setLoadingExistingCode] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const checkingLinkRef = useRef(false);

  const form = useForm<LinkPartnerFormData>({
    mode: 'onBlur',
    resolver: zodResolver(linkPartnerSchema),
    defaultValues: {
      partnerCode: '',
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const partnerCode = watch('partnerCode');

  useEffect(() => {
    const loadExistingCode = async () => {
      const existingLink = await getPartnerLinkCode();
      if (existingLink && existingLink.status === 'pending') {
        setGeneratedCode(existingLink.linkCode);
        logger.debug('Existing partner link code loaded', {
          linkCode: existingLink.linkCode,
        });
      }
      setLoadingExistingCode(false);
    };

    loadExistingCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateCode = async () => {
    setGenerating(true);
    logger.info('Partner link code generation requested');
    try {
      const code = await createPartnerLink();
      setGeneratedCode(code);
      logger.info('Partner link code generated successfully', { code });
      toast.success(t('toast.generatedTitle'), {
        description: t('toast.generatedMessage'),
      });
    } catch (error) {
      logger.error('Failed to generate partner link code', error as Error);
      toast.error(t('errors:title'), {
        description: (error as any)?.error ?? t('toast.generateError'),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await Clipboard.setStringAsync(generatedCode);
      logger.info('Partner link code copied to clipboard');
      toast.success(t('toast.copiedTitle'), { description: t('toast.copiedMessage') });
    }
  };

  const handleShareCode = async () => {
    if (!generatedCode) return;
    await Share.share({
      message: t('share.shareMessage', { code: generatedCode }),
    });
  };

  const onSubmit = async (data: LinkPartnerFormData) => {
    if (
      generatedCode &&
      data.partnerCode.trim().toUpperCase() === generatedCode.toUpperCase()
    ) {
      logger.warn('User attempted to join their own partner code');
      toast.error(t('errors:title'), { description: t('toast.ownCodeError') });
      return;
    }

    logger.info('Partner link join attempt', { partnerCode: data.partnerCode });
    try {
      await joinPartnerLink(data.partnerCode);
      usePermissionsStore
        .getState()
        .fetchMyPermissions()
        .catch(() => {});
      usePermissionsStore
        .getState()
        .fetchPartnerPermissions()
        .catch(() => {});
      useActionsStore
        .getState()
        .fetchMyActions()
        .catch(() => {});
      useActionsStore
        .getState()
        .fetchPartnerActions()
        .catch(() => {});
      usePointsStore
        .getState()
        .fetchPointsHistory()
        .catch(() => {});
      useStreakStore
        .getState()
        .fetchStreak()
        .catch(() => {});
      toast.success(t('toast.linkedTitle'), {
        description: t('toast.linkedMessage'),
      });
      router.replace('/(tabs)');
    } catch (error) {
      logger.error('Failed to join partner link', error as Error, {
        partnerCode: data.partnerCode,
      });
      toast.error(t('errors:title'), {
        description: (error as any)?.error ?? t('toast.joinError'),
      });
    }
  };

  const checkPartnerLink = useCallback(
    async (showWaitingMessage: boolean) => {
      if (checkingLinkRef.current) return;
      checkingLinkRef.current = true;
      if (showWaitingMessage) setRefreshing(true);
      try {
        const [user, partnerInfo] = await Promise.all([
          userService.getProfile(),
          userService.getPartnerInfo().catch(() => null),
        ]);

        if (partnerInfo) {
          logger.info('Partner link confirmed via refresh', {
            partnerName: partnerInfo.partner.firstName,
          });
          useUserStore.setState({ user, partnerInfo });
          usePermissionsStore
            .getState()
            .fetchMyPermissions()
            .catch(() => {});
          usePermissionsStore
            .getState()
            .fetchPartnerPermissions()
            .catch(() => {});
          useActionsStore
            .getState()
            .fetchMyActions()
            .catch(() => {});
          useActionsStore
            .getState()
            .fetchPartnerActions()
            .catch(() => {});
          usePointsStore
            .getState()
            .fetchPointsHistory()
            .catch(() => {});
          useStreakStore
            .getState()
            .fetchStreak()
            .catch(() => {});

          toast.success(t('toast.linkedSuccessTitle'), {
            description: t('toast.linkedSuccessMessage', {
              name: partnerInfo.partner.firstName,
            }),
          });

          router.replace('/(tabs)');
        } else if (showWaitingMessage) {
          toast.info(t('toast.waitingTitle'), {
            description: t('toast.waitingMessage'),
          });
        }
      } catch {
        if (showWaitingMessage) {
          toast.info(t('toast.waitingTitle'), {
            description: t('toast.waitingMessage'),
          });
        }
      } finally {
        checkingLinkRef.current = false;
        if (showWaitingMessage) setRefreshing(false);
      }
    },
    [router, t]
  );

  useEffect(() => {
    if (!generatedCode || linkMode !== 'share') return;
    const interval = setInterval(() => {
      checkPartnerLink(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [checkPartnerLink, generatedCode, linkMode]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.illustrationContainer}>
            <Ionicons
              name="extension-puzzle-outline"
              size={64}
              color={themeColors.primary}
            />
          </View>

          <Text style={[styles.title, { color: themeColors.text.primary }]}>
            {t('title')}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
            {t('subtitle')}
          </Text>

          <View style={[styles.hintBox, { backgroundColor: themeColors.primaryTint }]}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={themeColors.primary}
            />
            <Text style={[styles.hintText, { color: themeColors.text.primary }]}>
              {t('hint')}
            </Text>
          </View>

          <View
            style={[styles.modeControl, { backgroundColor: themeColors.gray[100] }]}
            accessibilityRole="tablist"
          >
            <PressableScale
              style={[
                styles.modeButton,
                linkMode === 'share' && {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() => setLinkMode('share')}
              accessibilityRole="tab"
              accessibilityState={{ selected: linkMode === 'share' }}
            >
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color:
                      linkMode === 'share'
                        ? themeColors.text.primary
                        : themeColors.text.secondary,
                  },
                ]}
              >
                {t('mode.share')}
              </Text>
            </PressableScale>
            <PressableScale
              style={[
                styles.modeButton,
                linkMode === 'join' && {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() => setLinkMode('join')}
              accessibilityRole="tab"
              accessibilityState={{ selected: linkMode === 'join' }}
            >
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color:
                      linkMode === 'join'
                        ? themeColors.text.primary
                        : themeColors.text.secondary,
                  },
                ]}
              >
                {t('mode.join')}
              </Text>
            </PressableScale>
          </View>

          {linkMode === 'share' ? (
            <Card style={styles.codeSection}>
              <Text style={[styles.sectionLabel, { color: themeColors.text.secondary }]}>
                {t('share.label')}
              </Text>

              {loadingExistingCode ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={themeColors.primary} />
                  <Text
                    style={[styles.loadingText, { color: themeColors.text.secondary }]}
                  >
                    {t('share.verifying')}
                  </Text>
                </View>
              ) : generatedCode ? (
                <View style={styles.generatedCodeContainer}>
                  <Text style={[styles.generatedCode, { color: themeColors.primary }]}>
                    {generatedCode}
                  </Text>
                  <Button
                    title={t('share.shareCode')}
                    onPress={handleShareCode}
                    fullWidth
                    icon="share-outline"
                  />
                  <Button
                    title={t('share.copyCode')}
                    onPress={handleCopyCode}
                    variant="outline"
                    fullWidth
                    icon="copy-outline"
                    style={styles.secondaryCodeButton}
                  />
                  <View style={styles.waitingRow}>
                    <ActivityIndicator size="small" color={themeColors.primary} />
                    <Text
                      style={[styles.refreshHint, { color: themeColors.text.secondary }]}
                    >
                      {t('share.waiting')}
                    </Text>
                  </View>
                  <Button
                    title={t('share.checkNow')}
                    onPress={() => checkPartnerLink(true)}
                    loading={refreshing}
                    variant="ghost"
                    fullWidth
                    icon="refresh-outline"
                  />
                </View>
              ) : (
                <Button
                  title={t('share.generate')}
                  onPress={handleGenerateCode}
                  loading={generating}
                  variant="outline"
                  fullWidth
                  icon="refresh-outline"
                />
              )}
            </Card>
          ) : (
            <>
              <Card style={styles.codeSection}>
                <Text
                  style={[styles.sectionLabel, { color: themeColors.text.secondary }]}
                >
                  {t('join.label')}
                </Text>
                <Controller
                  control={control}
                  name="partnerCode"
                  render={({ field: { onChange, value } }) => (
                    <CodeInput
                      value={value}
                      onChangeText={onChange}
                      length={6}
                      error={!!errors.partnerCode}
                    />
                  )}
                />
                {errors.partnerCode && (
                  <Text style={[styles.errorText, { color: themeColors.error }]}>
                    {errors.partnerCode.message}
                  </Text>
                )}
              </Card>

              <Button
                title={t('join.submit')}
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                disabled={partnerCode.length !== 6}
                fullWidth
                style={styles.linkButton}
                icon="link"
              />
            </>
          )}

          <PressableScale
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel={t('backA11y')}
          >
            <Text style={[styles.skipText, { color: themeColors.text.secondary }]}>
              {t('back')}
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.styles.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  hintText: {
    ...typography.styles.bodySm,
    flex: 1,
  },
  codeSection: {
    marginBottom: spacing.md,
  },
  modeControl: {
    padding: 4,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.md,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  modeLabel: {
    ...typography.styles.bodyMedium,
    textAlign: 'center',
  },
  sectionLabel: {
    ...typography.styles.bodyMedium,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  generatedCodeContainer: {
    alignItems: 'center',
  },
  generatedCode: {
    ...typography.styles.h1,
    letterSpacing: 8,
    marginBottom: spacing.md,
  },
  secondaryCodeButton: {
    marginTop: spacing.sm,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
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
  },
  refreshHint: {
    ...typography.styles.caption,
    textAlign: 'center',
    flexShrink: 1,
  },
  errorText: {
    ...typography.styles.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

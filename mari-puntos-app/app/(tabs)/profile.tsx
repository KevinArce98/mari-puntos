import React, { useState } from 'react';

import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  Avatar,
  Button,
  Card,
  EditProfileModal,
  ListItem,
  PressableScale,
  ProgressBar,
} from '@/components/ui';
import { usePoints, useThemedColors, useUser } from '@/hooks';
import { userService } from '@/services/userService';
import {
  LanguagePreference,
  useActionsStore,
  useLanguageStore,
  usePermissionsStore,
  usePointsStore,
  useStreakStore,
} from '@/stores';
import { borderRadius, shadows, spacing, typography } from '@/theme';

const SUPPORT_EMAIL = 'arias9068@gmail.com';

export default function ProfileScreen() {
  const { t } = useTranslation(['profile', 'common', 'errors']);
  const colors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user, partnerInfo, hasPartner, unlinkPartner, updateProfile } = useUser();
  const { myPoints, myLevel, progressToNextLevel, pointsToNextLevel } = usePoints();
  const languagePreference = useLanguageStore((s) => s.preference);
  const setLanguagePreference = useLanguageStore((s) => s.setPreference);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleChangeLanguage = () => {
    const options: { label: string; value: LanguagePreference }[] = [
      { label: t('language.system'), value: 'system' },
      { label: t('language.es'), value: 'es' },
      { label: t('language.en'), value: 'en' },
    ];
    Alert.alert(t('language.title'), undefined, [
      ...options.map((option) => ({
        text: option.value === languagePreference ? `${option.label}  ✓` : option.label,
        onPress: () => {
          if (option.value !== languagePreference) {
            setLanguagePreference(option.value);
          }
        },
      })),
      { text: t('common:actions.cancel'), style: 'cancel' as const },
    ]);
  };

  const handleUnlinkPartner = () => {
    Alert.alert(t('unlink.title'), t('unlink.message'), [
      { text: t('common:actions.cancel'), style: 'cancel' },
      {
        text: t('unlink.confirm'),
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await unlinkPartner();
            useActionsStore.getState().clearActions();
            usePermissionsStore.getState().clearPermissions();
            usePointsStore.getState().clearPoints();
            useStreakStore.getState().clearStreak();
            toast.success(t('unlink.successTitle'), {
              description: t('unlink.successMessage'),
            });
          } catch {
            toast.error(t('errors:title'), {
              description: t('unlink.errorMessage'),
            });
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleEditProfile = async (data: {
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  }) => {
    setLoading(true);
    try {
      await updateProfile(data);

      toast.success(t('edit.successTitle'), {
        description: t('edit.successMessage'),
      });
    } catch (error) {
      toast.error(t('errors:title'), { description: t('edit.errorMessage') });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('delete.title'), t('delete.message'), [
      { text: t('common:actions.cancel'), style: 'cancel' },
      {
        text: t('delete.confirm'),
        style: 'destructive',
        onPress: () => {
          Alert.alert(t('delete.confirmTitle'), t('delete.confirmMessage'), [
            { text: t('common:actions.cancel'), style: 'cancel' },
            {
              text: t('delete.confirmCta'),
              style: 'destructive',
              onPress: async () => {
                setLoading(true);
                try {
                  await userService.deleteAccount();
                  await signOut();
                } catch {
                  setLoading(false);
                  toast.error(t('errors:title'), {
                    description: t('delete.errorMessage'),
                  });
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert(t('signOutPrompt.title'), t('signOutPrompt.message'), [
      { text: t('common:actions.cancel'), style: 'cancel' },
      {
        text: t('signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t('title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              imageUri={user?.avatarUrl}
              name={user?.firstName}
              size="xl"
              showLevel
              level={myLevel}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text.primary }]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.text.secondary }]}>
                {user?.email}
              </Text>
            </View>
            <PressableScale
              style={[styles.editButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={() => setShowEditModal(true)}
              accessibilityRole="button"
              accessibilityLabel={t('editA11y')}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </PressableScale>
          </View>

          <View style={[styles.statsRow, { borderColor: colors.gray[100] }]}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {myPoints.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                {t('stats.points')}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.gray[200] }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{myLevel}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                {t('stats.level')}
              </Text>
            </View>
          </View>

          <View style={styles.levelProgress}>
            <View style={styles.levelProgressHeader}>
              <Text style={[styles.levelLabel, { color: colors.text.secondary }]}>
                {t('level.current', { level: myLevel })}
              </Text>
              <Text style={[styles.levelLabel, { color: colors.text.secondary }]}>
                {t('level.toNext', { points: pointsToNextLevel, level: myLevel + 1 })}
              </Text>
            </View>
            <ProgressBar
              progress={progressToNextLevel}
              color={colors.accent}
              height={8}
            />
          </View>
        </Card>

        {hasPartner && partnerInfo ? (
          <Card style={styles.partnerCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                {t('partner.title')}
              </Text>
              <PressableScale
                onPress={handleUnlinkPartner}
                disabled={loading}
                style={styles.unlinkButton}
                accessibilityRole="button"
                accessibilityLabel={t('partner.unlinkA11y')}
              >
                <Ionicons name="unlink" size={18} color={colors.error} />
              </PressableScale>
            </View>
            <View style={styles.partnerInfo}>
              <Avatar
                imageUri={partnerInfo.partner.avatarUrl}
                name={partnerInfo.partner.firstName}
                size="md"
              />
              <View style={styles.partnerDetails}>
                <Text style={[styles.partnerName, { color: colors.text.primary }]}>
                  {partnerInfo.partner.firstName}
                </Text>
                <Text style={[styles.partnerPoints, { color: colors.primary }]}>
                  {t('partner.points', {
                    points: partnerInfo.partner.totalPoints?.toLocaleString() || 0,
                  })}
                </Text>
              </View>
              <View
                style={[styles.partnerStatus, { backgroundColor: `${colors.success}15` }]}
              >
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.statusText, { color: colors.success }]}>
                  {t('partner.linked')}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.noPartnerCard}>
            <View
              style={[styles.noPartnerIcon, { backgroundColor: `${colors.primary}15` }]}
            >
              <Ionicons name="people-outline" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.noPartnerTitle, { color: colors.text.primary }]}>
              {t('partner.noneTitle')}
            </Text>
            <Text style={[styles.noPartnerText, { color: colors.text.secondary }]}>
              {t('partner.noneText')}
            </Text>
            <Button
              title={t('partner.linkCta')}
              onPress={() => router.push('/link-partner')}
              size="sm"
              icon="link"
            />
          </Card>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('sections.progress')}
          </Text>
          <Card padding="none" style={styles.menuCard}>
            <ListItem
              title={t('menu.achievements')}
              subtitle={t('menu.achievementsSubtitle')}
              leftIcon="trophy-outline"
              rightIcon="chevron-forward"
              onPress={() => router.push('/achievements')}
              showBorder
            />
            <ListItem
              title={t('menu.history')}
              subtitle={t('menu.historySubtitle')}
              leftIcon="time-outline"
              rightIcon="chevron-forward"
              onPress={() => router.push('/history')}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('sections.settings')}
          </Text>
          <Card padding="none" style={styles.menuCard}>
            <ListItem
              title={t('menu.language')}
              subtitle={t(`language.${languagePreference}`)}
              leftIcon="language-outline"
              rightIcon="chevron-forward"
              onPress={handleChangeLanguage}
              showBorder
            />
            <ListItem
              title={t('menu.notifications')}
              leftIcon="notifications-outline"
              rightIcon="chevron-forward"
              onPress={() => Linking.openSettings()}
              showBorder
            />
            <ListItem
              title={t('menu.changePassword')}
              leftIcon="lock-closed-outline"
              rightIcon="chevron-forward"
              onPress={() => router.push('/profile/change-password')}
              showBorder
            />
            <ListItem
              title={t('menu.privacy')}
              leftIcon="shield-outline"
              rightIcon="chevron-forward"
              onPress={() => Linking.openURL('https://maripuntos.com/privacidad')}
              showBorder
            />
            <ListItem
              title={t('menu.support')}
              leftIcon="help-circle-outline"
              rightIcon="chevron-forward"
              onPress={() =>
                Linking.openURL(
                  `mailto:${SUPPORT_EMAIL}?subject=Ayuda%20con%20MariPuntos`
                )
              }
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('sections.dangerZone')}
          </Text>
          <Card padding="none" style={styles.menuCard}>
            <ListItem
              title={t('menu.deleteAccount')}
              leftIcon="trash-outline"
              rightIcon="chevron-forward"
              titleStyle={{ color: colors.error }}
              leftIconColor={colors.error}
              onPress={handleDeleteAccount}
            />
          </Card>
        </View>

        <Button
          title={t('signOut')}
          onPress={handleSignOut}
          variant="outline"
          fullWidth
          style={styles.signOutButton}
          icon="log-out-outline"
        />

        <Text style={[styles.footer, { color: colors.text.light }]}>
          {t('version', { version: Constants.expoConfig?.version || '1.0.0' })}
        </Text>
      </ScrollView>

      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditProfile}
        currentFirstName={user?.firstName}
        currentLastName={user?.lastName}
        currentAvatarUrl={user?.avatarUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.styles.h2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing['3xl'],
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    ...typography.styles.h3,
    marginBottom: 2,
  },
  profileEmail: {
    ...typography.styles.caption,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlinkButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.styles.h3,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.styles.caption,
  },
  statDivider: {
    width: 1,
  },
  levelProgress: {
    marginTop: spacing.sm,
  },
  levelProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  levelLabel: {
    ...typography.styles.caption,
  },
  levelProgressText: {
    ...typography.styles.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  partnerCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  partnerName: {
    ...typography.styles.bodyMedium,
    marginBottom: 2,
  },
  partnerPoints: {
    ...typography.styles.caption,
  },
  partnerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.styles.small,
  },
  noPartnerCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  noPartnerIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noPartnerTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.xs,
  },
  noPartnerText: {
    ...typography.styles.caption,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.h4,
    marginBottom: spacing.md,
  },
  menuCard: {
    overflow: 'hidden',
  },
  signOutButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  footer: {
    ...typography.styles.small,
    textAlign: 'center',
    lineHeight: 18,
  },
});

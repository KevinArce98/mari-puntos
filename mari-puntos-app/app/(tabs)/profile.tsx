import { Avatar, Button, Card, ListItem, ProgressBar } from '@/components/ui';
import { usePoints, useUser } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user, partnerInfo, hasPartner } = useUser();
  const { myPoints, myLevel, progressToNextLevel } = usePoints();
  const [loading, setLoading] = useState(false);

  const handleUnlinkPartner = () => {
    Alert.alert(
      'Unlink Partner',
      'Are you sure you want to unlink your partner? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: Implement unlinkPartner in useUser hook
              Toast.show({
                type: 'success',
                text1: 'Unlinked',
                text2: 'Your partner has been unlinked',
              });
            } catch {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not unlink partner',
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
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
              <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{myPoints.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{myLevel}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Rewards</Text>
            </View>
          </View>

          {/* Level Progress */}
          <View style={styles.levelProgress}>
            <View style={styles.levelProgressHeader}>
              <Text style={styles.levelLabel}>Level {myLevel}</Text>
              <Text style={styles.levelLabel}>Level {myLevel + 1}</Text>
            </View>
            <ProgressBar 
              progress={progressToNextLevel} 
              color={colors.accent}
              height={10}
            />
            <Text style={styles.levelProgressText}>
              {Math.round(progressToNextLevel)}% to next level
            </Text>
          </View>
        </Card>

        {/* Partner Section */}
        {hasPartner && partnerInfo ? (
          <Card style={styles.partnerCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Partner</Text>
              <TouchableOpacity onPress={handleUnlinkPartner} disabled={loading}>
                <Ionicons name="unlink" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
            <View style={styles.partnerInfo}>
              <Avatar
                imageUri={partnerInfo.partner.avatarUrl}
                name={partnerInfo.partner.firstName}
                size="md"
              />
              <View style={styles.partnerDetails}>
                <Text style={styles.partnerName}>{partnerInfo.partner.firstName}</Text>
                <Text style={styles.partnerPoints}>{partnerInfo.partner.totalPoints?.toLocaleString() || 0} MariPuntos</Text>
              </View>
              <View style={styles.partnerStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Linked</Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.noPartnerCard}>
            <View style={styles.noPartnerIcon}>
              <Ionicons name="people-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.noPartnerTitle}>No Partner Linked</Text>
            <Text style={styles.noPartnerText}>Connect with your partner to start earning points together</Text>
            <Button
              title="Link Partner"
              onPress={() => router.push('/link-partner')}
              size="sm"
              icon="link"
            />
          </Card>
        )}

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Card padding="none" style={styles.menuCard}>
            <ListItem
              title="Edit Profile"
              leftIcon="person-outline"
              rightIcon="chevron-forward"
              onPress={() => {}}
            />
            <ListItem
              title="Notifications"
              leftIcon="notifications-outline"
              rightIcon="chevron-forward"
              onPress={() => {}}
            />
            <ListItem
              title="Privacy"
              leftIcon="shield-outline"
              rightIcon="chevron-forward"
              onPress={() => {}}
            />
            <ListItem
              title="Help & Support"
              leftIcon="help-circle-outline"
              rightIcon="chevron-forward"
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          fullWidth
          style={styles.signOutButton}
          icon="log-out-outline"
        />

        <Text style={styles.footer}>
          MariPuntos v1.0.0{'\n'}
          Made with 💑 for couples
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text.primary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
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
    color: colors.text.primary,
    marginBottom: 2,
  },
  profileEmail: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.styles.h3,
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
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
    color: colors.text.secondary,
  },
  levelProgressText: {
    ...typography.styles.caption,
    color: colors.accent,
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
    color: colors.text.primary,
    marginBottom: 2,
  },
  partnerPoints: {
    ...typography.styles.caption,
    color: colors.primary,
  },
  partnerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.styles.small,
    color: colors.success,
  },
  noPartnerCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  noPartnerIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noPartnerTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  noPartnerText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
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
    color: colors.text.light,
    textAlign: 'center',
    lineHeight: 18,
  },
});

import {
  Avatar,
  Button,
  Card,
  EditProfileModal,
  ListItem,
  ProgressBar,
} from '@/components/ui';
import { usePoints, useUser, useThemedColors } from '@/hooks';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const SUPPORT_EMAIL = 'soporte@maripuntos.com';

export default function ProfileScreen() {
  const colors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user, partnerInfo, hasPartner, unlinkPartner, updateProfile } = useUser();
  const { myPoints, myLevel, progressToNextLevel, pointsToNextLevel } = usePoints();
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUnlinkPartner = () => {
    Alert.alert(
      'Desvincular pareja',
      '¿Estás seguro de que deseas desvincular a tu pareja? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await unlinkPartner();
              Toast.show({
                type: 'success',
                text1: 'Desvinculado',
                text2: 'Tu pareja ha sido desvinculada',
              });
            } catch {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo desvincular a la pareja',
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = async (data: {
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  }) => {
    setLoading(true);
    try {
      await updateProfile(data);

      Toast.show({
        type: 'success',
        text1: 'Perfil actualizado',
        text2: 'Tu perfil se ha actualizado correctamente',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo actualizar el perfil',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Perfil</Text>

        {/* TODO: Configuración funcitonality */}
        {/* <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity> */}
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
              <Text style={[styles.profileName, { color: colors.text.primary }]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.text.secondary }]}>
                {user?.email}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: `${colors.primary}15` }]}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderColor: colors.gray[100] }]}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {myPoints.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Puntos
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.gray[200] }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{myLevel}</Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Nivel
              </Text>
            </View>
          </View>

          <View style={styles.levelProgress}>
            <View style={styles.levelProgressHeader}>
              <Text style={[styles.levelLabel, { color: colors.text.secondary }]}>
                Nivel {myLevel}
              </Text>
              <Text style={[styles.levelLabel, { color: colors.text.secondary }]}>
                {pointsToNextLevel} pts para nivel {myLevel + 1}
              </Text>
            </View>
            <ProgressBar
              progress={progressToNextLevel}
              color={colors.accent}
              height={8}
            />
          </View>
        </Card>

        {/* Partner Section */}
        {hasPartner && partnerInfo ? (
          <Card style={styles.partnerCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Tu Pareja
              </Text>
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
                <Text style={[styles.partnerName, { color: colors.text.primary }]}>
                  {partnerInfo.partner.firstName}
                </Text>
                <Text style={[styles.partnerPoints, { color: colors.primary }]}>
                  {partnerInfo.partner.totalPoints?.toLocaleString() || 0} MariPuntos
                </Text>
              </View>
              <View
                style={[styles.partnerStatus, { backgroundColor: `${colors.success}15` }]}
              >
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.statusText, { color: colors.success }]}>
                  Vinculado
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
              No Hay Pareja Vinculada
            </Text>
            <Text style={[styles.noPartnerText, { color: colors.text.secondary }]}>
              Conéctate con tu pareja para comenzar a ganar puntos juntos
            </Text>
            <Button
              title="Vincular Pareja"
              onPress={() => router.push('/link-partner')}
              size="sm"
              icon="link"
            />
          </Card>
        )}

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Configuración
          </Text>
          <Card padding="none" style={styles.menuCard}>
            <ListItem
              title="Notificaciones"
              leftIcon="notifications-outline"
              rightIcon="chevron-forward"
              onPress={() => Linking.openSettings()}
            />
            <ListItem
              title="Cambiar contraseña"
              leftIcon="lock-closed-outline"
              rightIcon="chevron-forward"
              onPress={() => router.push('/profile/change-password')}
            />
            <ListItem
              title="Privacidad"
              leftIcon="shield-outline"
              rightIcon="chevron-forward"
              onPress={() => Linking.openURL('https://maripuntos.com/privacidad')}
            />
            <ListItem
              title="Ayuda y Soporte"
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

        {/* Sign Out Button */}
        <Button
          title="Cerrar Sesión"
          onPress={handleSignOut}
          variant="outline"
          fullWidth
          style={styles.signOutButton}
          icon="log-out-outline"
        />

        <Text style={[styles.footer, { color: colors.text.light }]}>
          MariPuntos v{Constants.expoConfig?.version || '1.0.0'}
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
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
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

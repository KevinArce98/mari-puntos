// filepath: /Users/kevinarias/Projects/mari-puntos-app/app/(auth)/select-role.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { useUser } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import { UserRole } from '@/types';
import Toast from 'react-native-toast-message';

const ROLES = [
  {
    id: 'esposo' as UserRole,
    title: 'Soy Esposo',
    subtitle: 'The protector',
    icon: 'shield-outline',
    color: colors.primary,
  },
  {
    id: 'esposa' as UserRole,
    title: 'Soy Esposa',
    subtitle: 'The heart',
    icon: 'heart-outline',
    color: '#EC4899', // Pink
  },
];

export default function SelectRoleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useUser();
  
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) {
      Toast.show({
        type: 'error',
        text1: 'Select a role',
        text2: 'Please choose who you are playing as',
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ role: selectedRole });
      router.push('/link-partner');
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not save your role',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{"LET'S PLAY!"}</Text>
        <Text style={styles.title}>Who are you playing as?</Text>
        <Text style={styles.subtitle}>
          Choose your role to personalize your experience
        </Text>
      </View>

      {/* Role Cards */}
      <View style={styles.rolesContainer}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selectedRole === role.id && styles.roleCardSelected,
              selectedRole === role.id && { borderColor: role.color },
            ]}
            onPress={() => setSelectedRole(role.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.roleIconContainer, { backgroundColor: `${role.color}15` }]}>
              <Ionicons name={role.icon as any} size={48} color={role.color} />
            </View>
            <Text style={styles.roleTitle}>{role.title}</Text>
            <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
            
            {selectedRole === role.id && (
              <View style={[styles.checkmark, { backgroundColor: role.color }]}>
                <Ionicons name="checkmark" size={16} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Button */}
      <View style={styles.actions}>
        <Button
          title="Start Game"
          onPress={handleContinue}
          loading={loading}
          disabled={!selectedRole}
          fullWidth
          size="lg"
          icon="game-controller-outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[300],
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  eyebrow: {
    ...typography.styles.caption,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
    marginBottom: spacing.sm,
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
  },
  rolesContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    ...shadows.md,
  },
  roleCardSelected: {
    borderWidth: 2,
  },
  roleIconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roleTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  roleSubtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    marginTop: spacing.lg,
  },
});

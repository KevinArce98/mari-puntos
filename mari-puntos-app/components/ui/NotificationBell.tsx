import React, { useCallback, useEffect } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useThemedColors } from '@/hooks';
import { useActionsStore, usePermissionsStore } from '@/stores';
import { borderRadius, typography } from '@/theme';
import logger from '@/utils/logger';

interface NotificationBellProps {
  size?: number;
}

export function NotificationBell({ size = 26 }: NotificationBellProps) {
  const colors = useThemedColors();
  const router = useRouter();

  const pendingActionsCount = useActionsStore(
    (s) => s.partnerActions.filter((a) => a.status === 'pending').length
  );
  const pendingPermissionsCount = usePermissionsStore(
    (s) => s.partnerPermissions.filter((p) => p.status === 'pending').length
  );

  const totalPending = pendingActionsCount + pendingPermissionsCount;

  useEffect(() => {
    Notifications.setBadgeCountAsync(totalPending).catch((err) => {
      logger.warn('Failed to set badge count', err as Error);
    });
  }, [totalPending]);

  const handlePress = useCallback(() => {
    if (pendingActionsCount > 0 && pendingActionsCount >= pendingPermissionsCount) {
      router.push('/actions/review');
    } else if (pendingPermissionsCount > 0) {
      router.push('/(tabs)/permissions');
    }
  }, [pendingActionsCount, pendingPermissionsCount, router]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, { backgroundColor: colors.gray[100] }]}
      accessibilityRole="button"
      accessibilityLabel={`Notificaciones${totalPending > 0 ? `, ${totalPending} pendientes` : ''}`}
    >
      <Ionicons
        name={totalPending > 0 ? 'notifications' : 'notifications-outline'}
        size={size}
        color={totalPending > 0 ? colors.primary : colors.text.secondary}
      />
      {totalPending > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          <Text style={styles.badgeText}>{totalPending > 99 ? '99+' : totalPending}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    ...typography.styles.caption,
    color: '#fff',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Bold',
    lineHeight: 12,
  },
});

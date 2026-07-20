import React, { useCallback, useEffect } from 'react';

import { TouchableOpacity, View } from 'react-native';

import { Tabs, useRouter } from 'expo-router';
import type { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useThemedColors, useUser } from '@/hooks';
import { useActionsStore, usePermissionsStore, useUserStore } from '@/stores';
import logger from '@/utils/logger';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { hasPartner } = useUser();
  const colors = useThemedColors();
  const router = useRouter();

  const userId = useUserStore((s) => s.user?.id);
  const pendingActionsCount = useActionsStore(
    (s) => s.partnerActions.filter((a) => a.status === 'pending').length
  );
  const pendingPermissionsCount = usePermissionsStore(
    (s) => s.partnerPermissions.filter((p) => p.status === 'pending').length
  );
  const fetchPartnerPermissions = usePermissionsStore((s) => s.fetchPartnerPermissions);
  const fetchPartnerActions = useActionsStore((s) => s.fetchPartnerActions);

  // Pre-fetch both partner actions and permissions together so both badges
  // are available at the same time on startup (avoids staggered badge updates).
  useEffect(() => {
    if (!userId || !hasPartner) return;

    const permStore = usePermissionsStore.getState();
    const actStore = useActionsStore.getState();

    if (!permStore.isLoadingPartnerPermissions) {
      fetchPartnerPermissions().catch((error) => {
        logger.error('Failed to pre-fetch partner permissions in TabLayout', error);
      });
    }
    if (!actStore.isLoadingPartnerActions) {
      fetchPartnerActions().catch((error) => {
        logger.error('Failed to pre-fetch partner actions in TabLayout', error);
      });
    }
  }, [userId, hasPartner, fetchPartnerPermissions, fetchPartnerActions]);

  const lockedTabButton = useCallback(
    (props: any) => (
      <TouchableOpacity
        {...props}
        onPress={() => router.push('/link-partner')}
        style={props.style}
      />
    ),
    [router]
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        headerShown: false,
        // expo-router's vendored BottomTabBarButtonProps type has drifted from the
        // installed @react-navigation/elements version (duplicate HoverEffectProps/
        // pressColor declarations), so the two are structurally compatible at runtime
        // but not nominally assignable to TS.
        tabBarButton: HapticTab as (props: BottomTabBarButtonProps) => React.ReactNode,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'PlusJakartaSans-Medium',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: 'Acciones',
          tabBarIcon: ({ color, focused }) =>
            hasPartner ? (
              <Ionicons
                name={focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline'}
                size={24}
                color={color}
              />
            ) : (
              <View>
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={24}
                  color={colors.gray[300]}
                />
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color={colors.gray[400]}
                  style={{ position: 'absolute', right: -2, bottom: -2 }}
                />
              </View>
            ),
          tabBarButton: hasPartner ? undefined : lockedTabButton,
          tabBarBadge: pendingActionsCount > 0 ? pendingActionsCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.error, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="permissions"
        options={{
          title: 'Permisos',
          tabBarIcon: ({ color, focused }) =>
            hasPartner ? (
              <Ionicons
                name={focused ? 'hand-right' : 'hand-right-outline'}
                size={24}
                color={color}
              />
            ) : (
              <View>
                <Ionicons name="hand-right-outline" size={24} color={colors.gray[300]} />
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color={colors.gray[400]}
                  style={{ position: 'absolute', right: -2, bottom: -2 }}
                />
              </View>
            ),
          tabBarButton: hasPartner ? undefined : lockedTabButton,
          tabBarBadge: pendingPermissionsCount > 0 ? pendingPermissionsCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.error, fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="duel"
        options={{
          title: 'Duelo',
          tabBarIcon: ({ color, focused }) =>
            hasPartner ? (
              <Ionicons
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                size={24}
                color={color}
              />
            ) : (
              <View>
                <Ionicons name="stats-chart-outline" size={24} color={colors.gray[300]} />
                <Ionicons
                  name="lock-closed"
                  size={10}
                  color={colors.gray[400]}
                  style={{ position: 'absolute', right: -2, bottom: -2 }}
                />
              </View>
            ),
          tabBarButton: hasPartner ? undefined : lockedTabButton,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

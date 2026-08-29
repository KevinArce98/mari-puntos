import React, { useCallback } from 'react';

import { TouchableOpacity, View } from 'react-native';

import { Tabs, useRouter } from 'expo-router';
import type { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import {
  usePendingActionsCount,
  usePendingPermissionsCount,
  useThemedColors,
  useUser,
} from '@/hooks';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { hasPartner } = useUser();
  const colors = useThemedColors();
  const router = useRouter();
  const { t } = useTranslation('navigation');

  const pendingActionsCount = usePendingActionsCount();
  const pendingPermissionsCount = usePendingPermissionsCount();

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
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: t('tabs.actions'),
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
          title: t('tabs.permissions'),
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
          title: t('tabs.duel'),
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
          title: t('tabs.profile'),
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

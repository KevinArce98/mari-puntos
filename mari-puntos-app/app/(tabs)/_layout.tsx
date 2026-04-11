import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { shadows } from '@/theme';
import { useUser, useThemedColors } from '@/hooks';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { hasPartner } = useUser();
  const colors = useThemedColors();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.gray[100],
          borderTopWidth: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          ...shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
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
          tabBarButton: hasPartner
            ? undefined
            : (props) => (
                <TouchableOpacity
                  {...(props as any)}
                  onPress={() => router.push('/link-partner')}
                  style={props.style}
                />
              ),
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
          tabBarButton: hasPartner
            ? undefined
            : (props) => (
                <TouchableOpacity
                  {...(props as any)}
                  onPress={() => router.push('/link-partner')}
                  style={props.style}
                />
              ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // TODO: Add functionality later, this option hides the tab
          title: 'Ranking',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          href: null, // TODO: Add functionality later, this option hides the tab
          title: 'Logros',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'gift' : 'gift-outline'} size={24} color={color} />
          ),
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

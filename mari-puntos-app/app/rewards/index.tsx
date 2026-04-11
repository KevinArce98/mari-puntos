import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemedColors } from '@/hooks';
import { spacing, typography } from '@/theme';

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemedColors();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Recompensas
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Coming Soon */}
      <View style={styles.content}>
        <Ionicons name="gift-outline" size={72} color={colors.gray[300]} />
        <Text style={[styles.title, { color: colors.text.primary }]}>Próximamente</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Las recompensas estarán disponibles pronto. ¡Sigue acumulando puntos!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.styles.h3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  title: {
    ...typography.styles.h2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});

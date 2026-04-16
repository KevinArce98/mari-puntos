import React, { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Badge, Card } from '@/components/ui';
import { useRewards, useThemedColors, useUser } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';
import { Reward, RewardCategory } from '@/types';

const CATEGORY_LABELS: Record<RewardCategory, string> = {
  [RewardCategory.PERSONAL_TIME]: 'Tiempo personal',
  [RewardCategory.ENTERTAINMENT]: 'Entretenimiento',
  [RewardCategory.GIFTS]: 'Regalos',
  [RewardCategory.EXPERIENCES]: 'Experiencias',
  [RewardCategory.PRIVILEGES]: 'Privilegios',
  [RewardCategory.OTHER]: 'Otro',
};

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemedColors();
  const { user } = useUser();
  const { availableRewards, isLoading, error, redeemReward, refetchAvailable } =
    useRewards();
  const [refreshing, setRefreshing] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetchAvailable();
    }, [refetchAvailable])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchAvailable();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRedeem = (reward: Reward) => {
    Alert.alert(
      'Canjear recompensa',
      `¿Deseas canjear "${reward.title}" por ${reward.pointsCost} puntos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Canjear',
          style: 'destructive',
          onPress: async () => {
            setRedeeming(reward.id);
            try {
              await redeemReward(reward.id);
              Toast.show({
                type: 'success',
                text1: '¡Recompensa canjeada!',
                text2: `Disfrutá tu ${reward.title}`,
              });
              await refetchAvailable();
            } catch {
              Toast.show({ type: 'error', text1: 'Error al canjear la recompensa' });
            } finally {
              setRedeeming(null);
            }
          },
        },
      ]
    );
  };

  const renderReward = (reward: Reward) => {
    const isRedeeming = redeeming === reward.id;
    const canAfford = (user?.totalPoints ?? 0) >= reward.pointsCost;

    return (
      <Card key={reward.id} style={styles.rewardCard}>
        <View style={styles.rewardHeader}>
          <View style={styles.rewardInfo}>
            <Text style={[styles.rewardTitle, { color: colors.text.primary }]}>
              {reward.title}
            </Text>
            {reward.description ? (
              <Text style={[styles.rewardDescription, { color: colors.text.secondary }]}>
                {reward.description}
              </Text>
            ) : null}
          </View>
          <View style={styles.rewardMeta}>
            <Text style={[styles.pointsCost, { color: colors.primary }]}>
              {reward.pointsCost}
            </Text>
            <Text style={[styles.pointsLabel, { color: colors.text.secondary }]}>
              pts
            </Text>
          </View>
        </View>

        <View style={styles.rewardFooter}>
          <Badge
            label={CATEGORY_LABELS[reward.category] ?? reward.category}
            variant="primary"
            size="sm"
          />
          <TouchableOpacity
            style={[
              styles.redeemButton,
              {
                backgroundColor: canAfford ? colors.primary : colors.gray[300],
              },
            ]}
            onPress={() => handleRedeem(reward)}
            disabled={!canAfford || isRedeeming}
          >
            {isRedeeming ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={[styles.redeemButtonText, { color: colors.white }]}>
                {canAfford ? 'Canjear' : 'Sin puntos'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Card>
    );
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Recompensas
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Points balance */}
      {user && (
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.balanceLabel, { color: colors.white }]}>Tus puntos</Text>
          <Text style={[styles.balanceValue, { color: colors.white }]}>
            {user.totalPoints}
          </Text>
        </View>
      )}

      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {availableRewards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="gift-outline" size={64} color={colors.gray[300]} />
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                Sin recompensas disponibles
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
                ¡Sigue acumulando puntos para desbloquear recompensas!
              </Text>
            </View>
          ) : (
            availableRewards.map(renderReward)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerTitle: { ...typography.styles.h3 },
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  balanceLabel: { ...typography.styles.caption },
  balanceValue: { ...typography.styles.h1 },
  loader: { marginTop: spacing.xl },
  errorText: {
    ...typography.styles.body,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  scrollContent: { padding: spacing.lg },
  rewardCard: { marginBottom: spacing.md },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  rewardInfo: { flex: 1, marginRight: spacing.md },
  rewardTitle: { ...typography.styles.h4, marginBottom: spacing.xs },
  rewardDescription: { ...typography.styles.caption },
  rewardMeta: { alignItems: 'center' },
  pointsCost: { ...typography.styles.h2 },
  pointsLabel: { ...typography.styles.small },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  redeemButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 90,
    alignItems: 'center',
  },
  redeemButtonText: { ...typography.styles.bodyMedium },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.styles.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: { ...typography.styles.body, textAlign: 'center', lineHeight: 22 },
});

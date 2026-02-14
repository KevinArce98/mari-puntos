import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Chip } from '@/components/ui';
import { usePoints } from '@/hooks';
import { borderRadius, colors, spacing, typography } from '@/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

const CATEGORIES = ['All', 'Romantic', 'Activities', 'Naughty'];

export default function RewardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { myPoints } = usePoints();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mock rewards matching design
  const mockRewards = [
    {
      id: '1',
      name: 'Movie Night Choice',
      description: 'Pick any movie for date night',
      pointsCost: 150,
      category: 'Romantic',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200',
      locked: false,
    },
    {
      id: '2',
      name: 'Breakfast in Bed',
      description: 'Wake up to a delicious surprise',
      pointsCost: 200,
      category: 'Romantic',
      image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200',
      locked: false,
    },
    {
      id: '3',
      name: 'Game Night Pass',
      description: '3 hours of uninterrupted gaming',
      pointsCost: 300,
      category: 'Activities',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200',
      locked: false,
    },
    {
      id: '4',
      name: 'Spa Day',
      description: 'Full relaxation treatment',
      pointsCost: 500,
      category: 'Activities',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200',
      locked: true,
    },
  ];

  const filteredRewards =
    selectedCategory === 'All'
      ? mockRewards
      : mockRewards.filter((r) => r.category === selectedCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards Catalog</Text>
        <TouchableOpacity>
          <Text style={styles.historyLink}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Points Balance Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceIconContainer}>
            <Ionicons name="trophy" size={28} color={colors.accent} />
          </View>
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balancePoints}>{myPoints.toLocaleString()}</Text>
            <Text style={styles.balanceUnit}>MariPuntos available</Text>
          </View>
        </LinearGradient>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>

        {/* Rewards Grid */}
        <View style={styles.rewardsGrid}>
          {filteredRewards.map((reward) => {
            const canAfford = myPoints >= reward.pointsCost;
            const isLocked = reward.locked || !canAfford;

            return (
              <View key={reward.id} style={styles.rewardCardWrapper}>
                <Card style={styles.rewardCard} padding="none">
                  {/* Image */}
                  <View style={styles.rewardImageContainer}>
                    <Image source={{ uri: reward.image }} style={styles.rewardImage} />
                    {/* Points Badge */}
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsBadgeText}>{reward.pointsCost} pts</Text>
                    </View>
                    {/* Lock Overlay */}
                    {isLocked && (
                      <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={24} color={colors.white} />
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <View style={styles.rewardContent}>
                    <Text style={styles.rewardName} numberOfLines={1}>
                      {reward.name}
                    </Text>
                    <Text style={styles.rewardDescription} numberOfLines={2}>
                      {reward.description}
                    </Text>
                    <Button
                      title="Redeem"
                      onPress={() => {}}
                      size="sm"
                      fullWidth
                      disabled={isLocked}
                      style={styles.redeemButton}
                    />
                  </View>
                </Card>
              </View>
            );
          })}
        </View>

        {/* Suggest Custom Reward */}
        <TouchableOpacity style={styles.suggestLink}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.suggestText}>Suggest a Custom Reward</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  historyLink: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  balanceCard: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceIconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    ...typography.styles.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balancePoints: {
    fontSize: 36,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    lineHeight: 42,
  },
  balanceUnit: {
    ...typography.styles.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoriesContainer: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCardWrapper: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },
  rewardCard: {
    overflow: 'hidden',
  },
  rewardImageContainer: {
    position: 'relative',
    height: 100,
  },
  rewardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
  },
  pointsBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  pointsBadgeText: {
    ...typography.styles.small,
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardContent: {
    padding: spacing.sm,
  },
  rewardName: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  rewardDescription: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    minHeight: 32,
  },
  redeemButton: {
    marginTop: spacing.xs,
  },
  suggestLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  suggestText: {
    ...typography.styles.bodyMedium,
    color: colors.primary,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Chip } from '@/components/ui';
import { usePoints } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';

const CATEGORIES = ['All', 'Chores', 'Romance', 'Gifts'];

export default function ActionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { myPoints } = usePoints();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customAction, setCustomAction] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  // Mock suggested actions matching design
  const suggestedActions = [
    {
      id: '1',
      name: 'Wash the Dishes',
      description: 'Clean all dishes and dry them',
      points: 15,
      category: 'Chores',
      icon: 'water-outline',
    },
    {
      id: '2',
      name: 'Cook Dinner',
      description: 'Prepare a home-cooked meal',
      points: 25,
      category: 'Chores',
      icon: 'restaurant-outline',
    },
    {
      id: '3',
      name: 'Surprise Love Note',
      description: 'Write a heartfelt message',
      points: 20,
      category: 'Romance',
      icon: 'heart-outline',
    },
    {
      id: '4',
      name: 'Buy Flowers',
      description: 'Get a beautiful bouquet',
      points: 30,
      category: 'Gifts',
      icon: 'flower-outline',
    },
    {
      id: '5',
      name: 'Morning Coffee',
      description: 'Make their favorite coffee',
      points: 10,
      category: 'Romance',
      icon: 'cafe-outline',
    },
  ];

  const filteredActions = suggestedActions.filter(action => {
    const matchesCategory = selectedCategory === 'All' || action.category === selectedCategory;
    const matchesSearch = action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLogAction = async (actionId: string) => {
    setLoading(actionId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const action = suggestedActions.find(a => a.id === actionId);
      Toast.show({
        type: 'success',
        text1: 'Action Logged!',
        text2: `You earned ${action?.points} MariPuntos`,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not log action',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCustomAction = () => {
    if (!customAction.trim()) return;
    Toast.show({
      type: 'info',
      text1: 'Custom Action',
      text2: 'Submitted for partner approval',
    });
    setCustomAction('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Activity</Text>
        <View style={styles.pointsBadge}>
          <Ionicons name="trophy" size={16} color={colors.accent} />
          <Text style={styles.pointsBadgeText}>{myPoints.toLocaleString()} pts</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

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

        {/* Suggested Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Actions</Text>
          
          {filteredActions.map((action) => (
            <Card key={action.id} style={styles.actionCard}>
              <View style={styles.actionRow}>
                <View style={[styles.actionIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Ionicons 
                    name={action.icon as keyof typeof Ionicons.glyphMap} 
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                
                <View style={styles.actionContent}>
                  <Text style={styles.actionName}>{action.name}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                
                <View style={styles.actionRight}>
                  <Text style={styles.actionPoints}>+{action.points}</Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => handleLogAction(action.id)}
                    disabled={loading === action.id}
                  >
                    <Ionicons 
                      name={loading === action.id ? 'hourglass-outline' : 'add'} 
                      size={20} 
                      color={colors.white} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}

          {filteredActions.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyText}>No actions found</Text>
            </View>
          )}
        </View>

        {/* Custom Action Input */}
        <View style={styles.customActionContainer}>
          <Text style={styles.customActionLabel}>{"Can't find what you're looking for?"}</Text>
          <View style={styles.customActionRow}>
            <TextInput
              style={styles.customActionInput}
              placeholder="Describe your custom action..."
              placeholderTextColor={colors.gray[400]}
              value={customAction}
              onChangeText={setCustomAction}
            />
            <TouchableOpacity 
              style={[
                styles.customActionButton,
                !customAction.trim() && styles.customActionButtonDisabled
              ]}
              onPress={handleCustomAction}
              disabled={!customAction.trim()}
            >
              <Ionicons name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
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
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.sm,
  },
  pointsBadgeText: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing['3xl'],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.styles.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoriesContainer: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionCard: {
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionName: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  actionDescription: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  actionRight: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionPoints: {
    ...typography.styles.h4,
    color: colors.primary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  customActionContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  customActionLabel: {
    ...typography.styles.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  customActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customActionInput: {
    flex: 1,
    ...typography.styles.body,
    color: colors.text.primary,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  customActionButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customActionButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
});

// filepath: /Users/kevinarias/Projects/mari-puntos-app/app/permissions/review.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Input } from '@/components/ui';
import { usePermissions } from '@/hooks';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';

export default function ReviewActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { respondToPermission } = usePermissions();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock activity data - would come from params/API
  const activity = {
    id: params.id as string || '1',
    title: 'Cooked Dinner',
    category: 'Chores',
    timestamp: '2 hours ago',
    description: 'Made a delicious pasta dinner with homemade sauce',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    requestedBy: 'Kevin',
    pointsValue: 25,
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await respondToPermission(activity.id, {
        approved: true,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Activity Approved!',
        text2: `${activity.requestedBy} earned ${activity.pointsValue} points`,
      });
      
      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not approve activity',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await respondToPermission(activity.id, {
        approved: false,
      });
      
      Toast.show({
        type: 'info',
        text1: 'Activity Rejected',
        text2: 'Your partner has been notified',
      });
      
      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not reject activity',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Activity</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Activity Card */}
        <Card style={styles.activityCard} padding="none">
          {/* Image */}
          <Image
            source={{ uri: activity.image }}
            style={styles.activityImage}
          />
          
          {/* Content */}
          <View style={styles.activityContent}>
            <View style={styles.activityHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{activity.category}</Text>
              </View>
              <Text style={styles.timestamp}>{activity.timestamp}</Text>
            </View>
            
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            
            <View style={styles.activityFooter}>
              <Text style={styles.requestedBy}>Submitted by {activity.requestedBy}</Text>
              <Text style={styles.pointsValue}>+{activity.pointsValue} pts</Text>
            </View>
          </View>
        </Card>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate this activity</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingValue}>{rating}</Text>
            <View style={styles.ratingSlider}>
              <View style={styles.ratingTrack}>
                <View 
                  style={[
                    styles.ratingFill, 
                    { width: `${(rating / 10) * 100}%` }
                  ]} 
                />
              </View>
              <View style={styles.ratingLabels}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity 
                    key={num} 
                    onPress={() => setRating(num)}
                    style={styles.ratingTouchArea}
                  >
                    <View 
                      style={[
                        styles.ratingDot,
                        rating >= num && styles.ratingDotActive,
                      ]} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.ratingMinMax}>
              <Text style={styles.ratingLabel}>1</Text>
              <Text style={styles.ratingLabel}>10</Text>
            </View>
          </View>
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a comment (optional)</Text>
          <Input
            placeholder="Great job! Keep it up..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            containerStyle={styles.commentInput}
          />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.actionButtons}>
          <Button
            title="Reject"
            onPress={handleReject}
            variant="outline"
            loading={loading}
            style={styles.rejectButton}
            icon="close"
          />
          <Button
            title="Approve"
            onPress={handleApprove}
            loading={loading}
            style={styles.approveButton}
            icon="checkmark"
          />
        </View>
      </View>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 140,
  },
  activityCard: {
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  activityImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.gray[200],
  },
  activityContent: {
    padding: spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.category.chores,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    ...typography.styles.small,
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
  },
  timestamp: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  activityTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  activityDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  requestedBy: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  pointsValue: {
    ...typography.styles.h4,
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  ratingValue: {
    ...typography.styles.pointsMedium,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ratingSlider: {
    marginBottom: spacing.sm,
  },
  ratingTrack: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  ratingFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingTouchArea: {
    padding: spacing.xs,
  },
  ratingDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[300],
  },
  ratingDotActive: {
    backgroundColor: colors.accent,
  },
  ratingMinMax: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  commentInput: {
    marginBottom: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.lg,
    ...shadows.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rejectButton: {
    flex: 1,
  },
  approveButton: {
    flex: 1,
  },
});

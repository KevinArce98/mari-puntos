import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

const QUICK_ACTIVITIES = [
  { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline' },
  { id: 'friends', label: 'Friends', icon: 'people-outline' },
  { id: 'sports', label: 'Sports', icon: 'football-outline' },
];

const ACTIVITY_TYPES = [
  { id: 'gaming', label: 'Gaming Session', cost: 10 },
  { id: 'friends', label: 'Night Out with Friends', cost: 15 },
  { id: 'sports', label: 'Sports Activity', cost: 8 },
  { id: 'hobby', label: 'Personal Hobby Time', cost: 5 },
  { id: 'other', label: 'Other', cost: 10 },
];

export default function RequestPermissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestPermission } = usePermissions();
  
  const [selectedQuick, setSelectedQuick] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<string | null>(null);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [duration, setDuration] = useState(2); // hours
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedActivity = ACTIVITY_TYPES.find(a => a.id === activityType);
  const estimatedCost = selectedActivity ? selectedActivity.cost * duration : 0;

  const handleQuickSelect = (id: string) => {
    setSelectedQuick(id);
    setActivityType(id);
  };

  const handleRequest = async () => {
    if (!activityType) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select an activity type',
      });
      return;
    }

    setLoading(true);
    try {
      const activity = ACTIVITY_TYPES.find(a => a.id === activityType);
      await requestPermission({
        title: activity?.label || 'Activity Request',
        type: activityType as any, // Maps to PermissionType enum
        requestedDate: new Date().toISOString(),
        durationHours: duration,
        pointsCost: estimatedCost,
        description: note.trim() || undefined,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Request Sent!',
        text2: 'Your partner will receive a notification',
      });
      
      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not send request',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (change: number) => {
    const newDuration = Math.max(0.5, Math.min(8, duration + change));
    setDuration(newDuration);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick Select */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Select</Text>
          <View style={styles.quickSelectRow}>
            {QUICK_ACTIVITIES.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.quickSelectItem,
                  selectedQuick === activity.id && styles.quickSelectItemSelected,
                ]}
                onPress={() => handleQuickSelect(activity.id)}
              >
                <Ionicons 
                  name={activity.icon as keyof typeof Ionicons.glyphMap} 
                  size={24} 
                  color={selectedQuick === activity.id ? colors.white : colors.text.primary} 
                />
                <Text style={[
                  styles.quickSelectLabel,
                  selectedQuick === activity.id && styles.quickSelectLabelSelected,
                ]}>
                  {activity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Type</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowActivityPicker(!showActivityPicker)}
          >
            <Text style={[
              styles.dropdownText,
              !activityType && styles.dropdownPlaceholder,
            ]}>
              {selectedActivity?.label || 'Select activity type'}
            </Text>
            <Ionicons 
              name={showActivityPicker ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.gray[400]} 
            />
          </TouchableOpacity>
          
          {showActivityPicker && (
            <Card style={styles.dropdownMenu} padding="none">
              {ACTIVITY_TYPES.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.dropdownItem,
                    activityType === activity.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setActivityType(activity.id);
                    setShowActivityPicker(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{activity.label}</Text>
                  <Text style={styles.dropdownItemCost}>{activity.cost} pts/hr</Text>
                </TouchableOpacity>
              ))}
            </Card>
          )}
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity style={styles.dateTimeButton}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateTimeButton}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.dateTimeText}>7:00 PM</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Duration Control */}
        <View style={styles.section}>
          <View style={styles.durationHeader}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <Text style={styles.durationValue}>{duration} hours</Text>
          </View>
          
          <View style={styles.durationControl}>
            <TouchableOpacity 
              style={styles.durationButton}
              onPress={() => handleDurationChange(-0.5)}
            >
              <Ionicons name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.durationTrack}>
              <View 
                style={[
                  styles.durationFill, 
                  { width: `${(duration / 8) * 100}%` }
                ]} 
              />
            </View>
            
            <TouchableOpacity 
              style={styles.durationButton}
              onPress={() => handleDurationChange(0.5)}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Estimated Cost */}
          <View style={styles.costCard}>
            <Text style={styles.costLabel}>Estimated Cost</Text>
            <Text style={styles.costValue}>{estimatedCost} MariPuntos</Text>
          </View>
        </View>

        {/* Optional Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note (Optional)</Text>
          <Input
            placeholder="Add a message for your partner..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            containerStyle={styles.noteInput}
          />
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title="Send Request"
          onPress={handleRequest}
          loading={loading}
          disabled={!activityType}
          fullWidth
          icon="send"
        />
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
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickSelectRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickSelectItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
  },
  quickSelectItemSelected: {
    backgroundColor: colors.text.primary,
  },
  quickSelectLabel: {
    ...typography.styles.caption,
    color: colors.text.primary,
  },
  quickSelectLabelSelected: {
    color: colors.white,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  dropdownText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  dropdownPlaceholder: {
    color: colors.gray[400],
  },
  dropdownMenu: {
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  dropdownItemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  dropdownItemText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  dropdownItemCost: {
    ...typography.styles.caption,
    color: colors.primary,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  dateTimeText: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
  },
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  durationValue: {
    ...typography.styles.h4,
    color: colors.primary,
  },
  durationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  durationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  durationTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  durationFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  costCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.accent}15`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  costLabel: {
    ...typography.styles.bodyMedium,
    color: colors.text.secondary,
  },
  costValue: {
    ...typography.styles.h4,
    color: colors.accent,
  },
  noteInput: {
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
});

import React, { useEffect, useState } from 'react';

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useNavigation, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import {
  Button,
  Card,
  Chip,
  IconSelector,
  Input,
  PressableScale,
  Select,
} from '@/components/ui';
import { POINT_VALUE_PRESETS } from '@/constants/points';
import { useThemedColors } from '@/hooks';
import { permissionsService } from '@/services';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { PermissionCategory } from '@/types';
import logger from '@/utils/logger';

const CATEGORY_VALUES = [
  PermissionCategory.GAMING,
  PermissionCategory.SOCIAL,
  PermissionCategory.SPORTS,
  PermissionCategory.HOBBIES,
  PermissionCategory.ENTERTAINMENT,
  PermissionCategory.PERSONAL_TIME,
  PermissionCategory.OTHER,
];

export default function CreateTemplateScreen() {
  const { t } = useTranslation(['permissions', 'common', 'errors']);
  const themeColors = useThemedColors();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const CATEGORY_OPTIONS = CATEGORY_VALUES.map((value) => ({
    label: t(`categories.${value}`),
    value,
  }));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PermissionCategory>(PermissionCategory.OTHER);
  const [suggestedDuration, setSuggestedDuration] = useState('2');
  const [suggestedPoints, setSuggestedPoints] = useState('50');
  const [selectedIcon, setSelectedIcon] = useState('sparkles-outline');
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [allowExit, setAllowExit] = useState(false);

  const isDirty =
    Boolean(title.trim() || description.trim()) ||
    category !== PermissionCategory.OTHER ||
    suggestedDuration !== '2' ||
    suggestedPoints !== '50' ||
    selectedIcon !== 'sparkles-outline';

  usePreventRemove(isDirty && !allowExit, ({ data }) => {
    Alert.alert(t('createTemplate.discard.title'), t('createTemplate.discard.message'), [
      { text: t('common:actions.keepEditing'), style: 'cancel' },
      {
        text: t('createTemplate.discard.confirm'),
        style: 'destructive',
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error(t('errors:title'), { description: t('createTemplate.titleRequired') });
      return;
    }

    const duration = parseFloat(suggestedDuration);
    const points = parseFloat(suggestedPoints);

    if (isNaN(duration) || duration <= 0) {
      toast.error(t('errors:title'), {
        description: t('createTemplate.durationInvalid'),
      });
      return;
    }

    if (isNaN(points) || points < 0) {
      toast.error(t('errors:title'), {
        description: t('createTemplate.pointsInvalid'),
      });
      return;
    }

    setLoading(true);
    try {
      await permissionsService.createTemplate({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        suggestedDurationHours: duration,
        suggestedPointsCost: points,
        metadata: {
          icon: selectedIcon,
        },
      });

      logger.info('Permission template created', { title: title.trim(), category });

      toast.success(t('createTemplate.createdTitle'), {
        description: t('createTemplate.createdMessage'),
      });

      setAllowExit(true);
      setTimeout(() => router.back(), 0);
    } catch (error) {
      logger.error('Failed to create permission template', error as Error, {
        title: title.trim(),
        category,
        suggestedDurationHours: duration,
        suggestedPointsCost: points,
      });
      toast.error(t('errors:title'), { description: t('createTemplate.createError') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('createTemplate.backA11y')}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
        </PressableScale>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
          {t('createTemplate.headerTitle')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, marginBottom: keyboardHeight + 50 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                {t('createTemplate.iconLabel')}
              </Text>
              <PressableScale
                style={[styles.iconButton, { backgroundColor: themeColors.gray[100] }]}
                onPress={() => setShowIconSelector(true)}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: `${themeColors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name={selectedIcon as keyof typeof Ionicons.glyphMap}
                    size={40}
                    color={themeColors.primary}
                  />
                </View>
                <View style={styles.iconButtonContent}>
                  <Text
                    style={[styles.iconButtonText, { color: themeColors.text.primary }]}
                  >
                    {t('createTemplate.iconButtonTitle')}
                  </Text>
                  <Text
                    style={[
                      styles.iconButtonSubtext,
                      { color: themeColors.text.secondary },
                    ]}
                  >
                    {t('createTemplate.iconButtonSubtitle')}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={themeColors.gray[400]}
                />
              </PressableScale>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                {t('createTemplate.titleLabel')}
              </Text>
              <Input
                placeholder={t('createTemplate.titlePlaceholder')}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                {t('createTemplate.descriptionLabel')}
              </Text>
              <Input
                placeholder={t('createTemplate.descriptionPlaceholder')}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                {t('createTemplate.categoryLabel')}
              </Text>
              <Select
                options={CATEGORY_OPTIONS}
                value={category}
                onValueChange={(value) => setCategory(value as PermissionCategory)}
                placeholder={t('createTemplate.categoryPlaceholder')}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                {t('createTemplate.durationLabel')}
              </Text>
              <Input
                placeholder={t('createTemplate.durationPlaceholder')}
                value={suggestedDuration}
                onChangeText={setSuggestedDuration}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                {t('createTemplate.pointsLabel')}
              </Text>
              <View style={styles.pointsPresets}>
                {POINT_VALUE_PRESETS.map((value) => (
                  <Chip
                    key={value}
                    label={String(value)}
                    selected={suggestedPoints === String(value)}
                    onPress={() => setSuggestedPoints(String(value))}
                    style={styles.pointsPresetChip}
                  />
                ))}
              </View>
            </View>

            <Card
              style={[
                styles.infoCard,
                {
                  backgroundColor:
                    Platform.OS === 'ios'
                      ? `${themeColors.primary}08`
                      : themeColors.white,
                  borderColor: `${themeColors.primary}20`,
                },
              ]}
            >
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="information-circle"
                  size={24}
                  color={themeColors.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: themeColors.text.primary }]}>
                  Actividad personalizada
                </Text>
                <Text style={[styles.infoText, { color: themeColors.text.secondary }]}>
                  Esta actividad estará disponible solo para ti y tu pareja. Los valores
                  sugeridos son una guía y pueden modificarse al solicitar el permiso.
                </Text>
              </View>
            </Card>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.bottomContainer,
          {
            backgroundColor: themeColors.background,
            paddingBottom: insets.bottom + spacing.md,
            bottom: keyboardHeight,
          },
        ]}
      >
        <Button
          title={t('createTemplate.submit')}
          onPress={handleCreate}
          loading={loading}
          disabled={!title.trim()}
          fullWidth
          icon="checkmark-circle"
        />
      </View>

      <IconSelector
        visible={showIconSelector}
        selectedIcon={selectedIcon}
        onSelect={setSelectedIcon}
        onClose={() => setShowIconSelector(false)}
      />
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
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    ...typography.styles.h3,
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
    marginBottom: spacing.md,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconButtonContent: {
    flex: 1,
  },
  iconButtonText: {
    ...typography.styles.bodyMedium,
  },
  iconButtonSubtext: {
    ...typography.styles.caption,
    marginTop: spacing.xs,
  },
  pointsPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pointsPresetChip: {
    marginRight: 0,
  },
  infoCard: {
    flexDirection: 'row',
    borderWidth: 1,
  },
  infoIconContainer: {
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.styles.bodyMedium,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.styles.caption,
    lineHeight: 18,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    ...shadows.lg,
  },
});

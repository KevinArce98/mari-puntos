import React, { useEffect, useState } from 'react';

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';
import { ActionCategory } from '@/types';
import {
  type CreateActionFormData,
  createActionSchema,
} from '@/validators/action.schema';

import { Button } from './Button';
import { ControlledInput } from './ControlledInput';
import { PressableScale } from './PressableScale';
import { TextAreaWithCounter } from './TextAreaWithCounter';

interface CreateActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActionFormData) => Promise<void>;
}

const CATEGORY_ICONS: Record<ActionCategory, keyof typeof Ionicons.glyphMap> = {
  [ActionCategory.HOUSEHOLD]: 'home',
  [ActionCategory.CHILDCARE]: 'people',
  [ActionCategory.ERRANDS]: 'cart',
  [ActionCategory.ROMANTIC]: 'heart',
  [ActionCategory.PERSONAL_GROWTH]: 'trending-up',
  [ActionCategory.OTHER]: 'ellipsis-horizontal',
};

export function CreateActionModal({
  visible,
  onClose,
  onSubmit,
}: CreateActionModalProps) {
  const { t } = useTranslation(['modals', 'common']);
  const themeColors = useThemedColors();
  const insets = useSafeAreaInsets();
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const CATEGORIES: {
    value: ActionCategory;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    ActionCategory.HOUSEHOLD,
    ActionCategory.CHILDCARE,
    ActionCategory.ERRANDS,
    ActionCategory.ROMANTIC,
    ActionCategory.PERSONAL_GROWTH,
    ActionCategory.OTHER,
  ].map((value) => ({
    value,
    label: t(`common:actionCategories.${value}`),
    icon: CATEGORY_ICONS[value],
  }));

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e) => {
      setKeyboardOffset(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, isValid },
  } = useForm<CreateActionFormData>({
    mode: 'onChange',
    resolver: zodResolver(createActionSchema),
    defaultValues: {
      title: '',
      description: '',
      category: ActionCategory.HOUSEHOLD,
    },
  });

  const onSubmitForm = async (data: CreateActionFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch {
      void 0;
    }
  };

  const handleClose = () => {
    const close = () => {
      reset();
      onClose();
    };

    if (isDirty) {
      Alert.alert(t('createAction.discard.title'), t('createAction.discard.message'), [
        { text: t('createAction.discard.stay'), style: 'cancel' },
        {
          text: t('createAction.discard.confirm'),
          style: 'destructive',
          onPress: close,
        },
      ]);
      return;
    }
    close();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={handleClose}
    >
      <View
        style={[styles.overlay, Platform.OS === 'android' && { paddingTop: insets.top }]}
      >
        <KeyboardAvoidingView
          style={[
            styles.keyboardAvoidingView,
            keyboardOffset > 0 && {
              paddingBottom: keyboardOffset + (Platform.OS === 'android' ? 20 : 0),
            },
          ]}
        >
          <View
            style={[
              styles.container,
              {
                backgroundColor: themeColors.gray[100],
                paddingBottom: spacing.xl + (keyboardOffset > 0 ? 0 : insets.bottom),
              },
            ]}
            accessibilityViewIsModal
          >
            <View style={[styles.header, { borderBottomColor: themeColors.gray[200] }]}>
              <Text style={[styles.title, { color: themeColors.text.primary }]}>
                {t('createAction.title')}
              </Text>
              <PressableScale
                onPress={handleClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={t('createAction.closeA11y')}
              >
                <Ionicons name="close" size={24} color={themeColors.text.primary} />
              </PressableScale>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>
                  {t('createAction.titleLabel')}
                </Text>
                <ControlledInput
                  control={control}
                  name="title"
                  placeholder={t('createAction.titlePlaceholder')}
                  maxLength={100}
                />
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>
                  {t('createAction.descriptionLabel')}
                </Text>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <TextAreaWithCounter
                      placeholder={t('createAction.descriptionPlaceholder')}
                      value={value ?? ''}
                      onChangeText={onChange}
                      numberOfLines={4}
                      textAlignVertical="top"
                      maxLength={500}
                    />
                  )}
                />
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>
                  {t('createAction.categoryLabel')}
                </Text>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.categoriesGrid}>
                      {CATEGORIES.map((category) => (
                        <PressableScale
                          key={category.value}
                          style={[
                            styles.categoryCard,
                            { backgroundColor: themeColors.gray[100] },
                            value === category.value && [
                              styles.categoryCardSelected,
                              {
                                backgroundColor: `${themeColors.primary}10`,
                                borderColor: themeColors.primary,
                              },
                            ],
                          ]}
                          onPress={() => onChange(category.value)}
                          accessibilityRole="button"
                          accessibilityLabel={category.label}
                          accessibilityState={{ selected: value === category.value }}
                        >
                          <Ionicons
                            name={category.icon}
                            size={24}
                            color={
                              value === category.value
                                ? themeColors.primary
                                : themeColors.gray[400]
                            }
                          />
                          <Text
                            style={[
                              styles.categoryLabel,
                              { color: themeColors.gray[600] },
                              value === category.value && [
                                styles.categoryLabelSelected,
                                { color: themeColors.primary },
                              ],
                            ]}
                          >
                            {category.label}
                          </Text>
                        </PressableScale>
                      ))}
                    </View>
                  )}
                />
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <Button
                title={t('common:actions.cancel')}
                variant="outline"
                onPress={handleClose}
                style={styles.actionButton}
                disabled={isSubmitting}
              />
              <Button
                title={t('createAction.submit')}
                onPress={handleSubmit(onSubmitForm)}
                style={styles.actionButton}
                disabled={isSubmitting || !isValid}
                loading={isSubmitting}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.styles.h3,
  },
  closeButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  label: {
    ...typography.styles.bodyMedium,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.styles.body,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '31%',
    height: 80,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryCardSelected: {
    borderWidth: 2,
  },
  categoryLabel: {
    ...typography.styles.caption,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

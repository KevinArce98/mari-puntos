import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionCategory } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { useThemedColors } from '@/hooks';
import { Button } from './Button';
import { ControlledInput } from './ControlledInput';
import {
  createActionSchema,
  type CreateActionFormData,
} from '@/validators/action.schema';


interface CreateActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActionFormData) => Promise<void>;
}

const CATEGORIES: {
  value: ActionCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: ActionCategory.HOUSEHOLD, label: 'Hogar', icon: 'home' },
  { value: ActionCategory.CHILDCARE, label: 'Cuidado Niños', icon: 'people' },
  { value: ActionCategory.ERRANDS, label: 'Mandados', icon: 'cart' },
  { value: ActionCategory.ROMANTIC, label: 'Romántico', icon: 'heart' },
  { value: ActionCategory.PERSONAL_GROWTH, label: 'Crecimiento', icon: 'trending-up' },
  { value: ActionCategory.OTHER, label: 'Otro', icon: 'ellipsis-horizontal' },
];

export function CreateActionModal({
  visible,
  onClose,
  onSubmit,
}: CreateActionModalProps) {
  const themeColors = useThemedColors();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateActionFormData>({
    resolver: zodResolver(createActionSchema),
    defaultValues: {
      title: '',
      description: '',
      category: ActionCategory.HOUSEHOLD,
    },
  });

  const onSubmitForm = async (data: CreateActionFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={[styles.container, { backgroundColor: themeColors.gray[100] }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: themeColors.gray[200] }]}>
              <Text style={[styles.title, { color: themeColors.text.primary }]}>Crear Acción</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={themeColors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title Input */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>Título *</Text>
                <ControlledInput
                  control={control}
                  name="title"
                  placeholder="Ej: Preparé la cena"
                  maxLength={100}
                />
              </View>

              {/* Description Input */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>Descripción (opcional)</Text>
                <ControlledInput
                  control={control}
                  name="description"
                  placeholder="Agrega detalles sobre lo que hiciste..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>

              {/* Category Selection */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: themeColors.text.primary }]}>Categoría *</Text>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.categoriesGrid}>
                      {CATEGORIES.map((category) => (
                        <TouchableOpacity
                          key={category.value}
                          style={[
                            styles.categoryCard,
                            { backgroundColor: themeColors.gray[100] },
                            value === category.value && [
                              styles.categoryCardSelected,
                              { backgroundColor: `${themeColors.primary}10`, borderColor: themeColors.primary },
                            ],
                          ]}
                          onPress={() => onChange(category.value)}
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
                              value === category.value && [styles.categoryLabelSelected, { color: themeColors.primary }],
                            ]}
                          >
                            {category.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={handleClose}
                style={styles.actionButton}
                disabled={loading}
              />
              <Button
                title="Crear"
                onPress={handleSubmit(onSubmitForm)}
                style={styles.actionButton}
                disabled={isSubmitting}
                loading={loading}
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
    paddingBottom: spacing.xl,
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
    padding: spacing.xs,
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
    fontWeight: '600',
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

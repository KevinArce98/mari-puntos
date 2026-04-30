import React, { useEffect, useState } from 'react';

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Button, Card, IconSelector, Input, Select } from '@/components/ui';
import { useThemedColors } from '@/hooks';
import { permissionsService } from '@/services';
import { borderRadius, shadows, spacing, typography } from '@/theme';
import { PermissionCategory } from '@/types';
import logger from '@/utils/logger';

const CATEGORY_OPTIONS = [
  { label: 'Gaming', value: PermissionCategory.GAMING },
  { label: 'Social', value: PermissionCategory.SOCIAL },
  { label: 'Deportes', value: PermissionCategory.SPORTS },
  { label: 'Hobbies', value: PermissionCategory.HOBBIES },
  { label: 'Entretenimiento', value: PermissionCategory.ENTERTAINMENT },
  { label: 'Tiempo Personal', value: PermissionCategory.PERSONAL_TIME },
  { label: 'Otro', value: PermissionCategory.OTHER },
];

export default function CreateTemplateScreen() {
  const themeColors = useThemedColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PermissionCategory>(PermissionCategory.OTHER);
  const [suggestedDuration, setSuggestedDuration] = useState('2');
  const [suggestedPoints, setSuggestedPoints] = useState('50');
  const [selectedIcon, setSelectedIcon] = useState('sparkles-outline');
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El título es requerido',
      });
      return;
    }

    const duration = parseFloat(suggestedDuration);
    const points = parseFloat(suggestedPoints);

    if (isNaN(duration) || duration <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'La duración debe ser mayor a 0',
      });
      return;
    }

    if (isNaN(points) || points < 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Los puntos deben ser 0 o mayor',
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

      Toast.show({
        type: 'success',
        text1: '¡Éxito!',
        text2: 'Actividad personalizada creada',
      });

      router.back();
    } catch (error) {
      logger.error('Failed to create permission template', error as Error, {
        title: title.trim(),
        category,
        suggestedDurationHours: duration,
        suggestedPointsCost: points,
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo crear la actividad',
      });
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
          paddingTop: Platform.OS !== 'ios' ? insets.top : 0,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
          Nueva Actividad
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
            {/* Icon Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                Icono
              </Text>
              <TouchableOpacity
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
                    Seleccionar Icono
                  </Text>
                  <Text
                    style={[
                      styles.iconButtonSubtext,
                      { color: themeColors.text.secondary },
                    ]}
                  >
                    Personaliza el icono de tu actividad
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={themeColors.gray[400]}
                />
              </TouchableOpacity>
            </View>

            {/* Title */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                Título *
              </Text>
              <Input
                placeholder="Ej: Noche de Poker, Día de Golf..."
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                Descripción (Opcional)
              </Text>
              <Input
                placeholder="Describe la actividad..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                Categoría
              </Text>
              <Select
                options={CATEGORY_OPTIONS}
                value={category}
                onValueChange={(value) => setCategory(value as PermissionCategory)}
                placeholder="Selecciona una categoría"
              />
            </View>

            {/* Duration & Points */}
            <View style={styles.row}>
              <View style={[styles.section, styles.halfWidth]}>
                <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                  Duración (hrs)
                </Text>
                <Input
                  placeholder="2"
                  value={suggestedDuration}
                  onChangeText={setSuggestedDuration}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.section, styles.halfWidth]}>
                <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>
                  Puntos Sugeridos
                </Text>
                <Input
                  placeholder="50"
                  value={suggestedPoints}
                  onChangeText={setSuggestedPoints}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Info Card */}
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
                  Actividad Personalizada
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

      {/* Bottom Button */}
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
          title="Crear Actividad"
          onPress={handleCreate}
          loading={loading}
          disabled={!title.trim()}
          fullWidth
          icon="checkmark-circle"
        />
      </View>

      {/* Icon Selector Modal */}
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
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

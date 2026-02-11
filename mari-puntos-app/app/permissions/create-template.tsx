import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Input, IconSelector, Select } from '@/components/ui';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import Toast from 'react-native-toast-message';
import { PermissionCategory } from '@/types';
import { permissionsService } from '@/services';

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

  const handleCreate = async () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El título es requerido',
      });
      return;
    }

    const duration = parseInt(suggestedDuration);
    const points = parseInt(suggestedPoints);

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

      Toast.show({
        type: 'success',
        text1: '¡Éxito!',
        text2: 'Actividad personalizada creada',
      });

      router.back();
    } catch (error) {
      console.error('Error creating template:', error);
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Actividad</Text>
        <View style={{ width: 40 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Icono</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowIconSelector(true)}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={selectedIcon as keyof typeof Ionicons.glyphMap}
                  size={40}
                  color={colors.primary}
                />
              </View>
              <View style={styles.iconButtonContent}>
                <Text style={styles.iconButtonText}>Seleccionar Icono</Text>
                <Text style={styles.iconButtonSubtext}>
                  Personaliza el icono de tu actividad
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Título *</Text>
            <Input
              placeholder="Ej: Noche de Poker, Día de Golf..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción (Opcional)</Text>
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
            <Text style={styles.sectionTitle}>Categoría</Text>
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
              <Text style={styles.sectionTitle}>Duración (hrs)</Text>
              <Input
                placeholder="2"
                value={suggestedDuration}
                onChangeText={setSuggestedDuration}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.sectionTitle}>Puntos Sugeridos</Text>
              <Input
                placeholder="50"
                value={suggestedPoints}
                onChangeText={setSuggestedPoints}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Info Card */}
          <Card style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Actividad Personalizada</Text>
              <Text style={styles.infoText}>
                Esta actividad estará disponible solo para ti y tu pareja. Los valores
                sugeridos son una guía y pueden modificarse al solicitar el permiso.
              </Text>
            </View>
          </Card>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Bottom Button */}
      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}
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
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconButtonContent: {
    flex: 1,
  },
  iconButtonText: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
  },
  iconButtonSubtext: {
    ...typography.styles.caption,
    color: colors.text.secondary,
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
    backgroundColor: `${colors.primary}08`,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  infoIconContainer: {
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.styles.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    lineHeight: 18,
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

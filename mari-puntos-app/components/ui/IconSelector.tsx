import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Platform,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks';

const ICON_OPTIONS = [
  { name: 'game-controller-outline', label: 'Gaming' },
  { name: 'people-outline', label: 'Amigos' },
  { name: 'football-outline', label: 'Deportes' },
  { name: 'basketball-outline', label: 'Basketball' },
  { name: 'beer-outline', label: 'Cerveza' },
  { name: 'wine-outline', label: 'Vino' },
  { name: 'fast-food-outline', label: 'Comida' },
  { name: 'restaurant-outline', label: 'Restaurante' },
  { name: 'cafe-outline', label: 'Café' },
  { name: 'musical-notes-outline', label: 'Música' },
  { name: 'headset-outline', label: 'Audífonos' },
  { name: 'film-outline', label: 'Película' },
  { name: 'tv-outline', label: 'TV' },
  { name: 'book-outline', label: 'Libro' },
  { name: 'bicycle-outline', label: 'Bicicleta' },
  { name: 'car-sport-outline', label: 'Auto' },
  { name: 'airplane-outline', label: 'Avión' },
  { name: 'beach-outline', label: 'Playa' },
  { name: 'fitness-outline', label: 'Gimnasio' },
  { name: 'barbell-outline', label: 'Pesas' },
  { name: 'tennisball-outline', label: 'Tenis' },
  { name: 'golf-outline', label: 'Golf' },
  { name: 'baseball-outline', label: 'Baseball' },
  { name: 'american-football-outline', label: 'Fútbol Americano' },
  { name: 'camera-outline', label: 'Fotografía' },
  { name: 'color-palette-outline', label: 'Arte' },
  { name: 'brush-outline', label: 'Pintura' },
  { name: 'build-outline', label: 'Herramientas' },
  { name: 'hammer-outline', label: 'Construcción' },
  { name: 'hardware-chip-outline', label: 'Tecnología' },
  { name: 'game-controller', label: 'Videojuegos' },
  { name: 'trophy-outline', label: 'Trofeo' },
  { name: 'medal-outline', label: 'Medalla' },
  { name: 'star-outline', label: 'Estrella' },
  { name: 'heart-outline', label: 'Corazón' },
  { name: 'chatbubbles-outline', label: 'Chat' },
  { name: 'pizza-outline', label: 'Pizza' },
  { name: 'ice-cream-outline', label: 'Helado' },
  { name: 'leaf-outline', label: 'Naturaleza' },
  { name: 'bed-outline', label: 'Descanso' },
  { name: 'moon-outline', label: 'Noche' },
  { name: 'sunny-outline', label: 'Día' },
  { name: 'thunderstorm-outline', label: 'Tormenta' },
  { name: 'umbrella-outline', label: 'Lluvia' },
  { name: 'gift-outline', label: 'Regalo' },
  { name: 'balloon-outline', label: 'Fiesta' },
  { name: 'sparkles-outline', label: 'Especial' },
  { name: 'flame-outline', label: 'Pasión' },
];

interface IconSelectorProps {
  visible: boolean;
  selectedIcon: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  visible,
  selectedIcon,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();

  const filteredIcons = ICON_OPTIONS.filter(
    (icon) =>
      icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
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
        <View
          style={[
            styles.header,
            {
              backgroundColor: themeColors.gray[100],
              borderBottomColor: themeColors.gray[200],
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>
            Seleccionar Icono
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={themeColors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={[styles.searchContainer, { backgroundColor: themeColors.gray[100] }]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={themeColors.gray[400]}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text.primary }]}
            placeholder="Buscar icono..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={themeColors.gray[400]}
          />
        </View>

        {/* Icons Grid */}
        <ScrollView contentContainerStyle={styles.gridContainer}>
          {filteredIcons.map((icon) => (
            <TouchableOpacity
              key={icon.name}
              style={[
                styles.iconItem,
                selectedIcon === icon.name && {
                  backgroundColor: themeColors.background,
                  borderRadius: borderRadius.lg,
                },
              ]}
              onPress={() => handleSelect(icon.name)}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: themeColors.gray[100] },
                  selectedIcon === icon.name && { backgroundColor: themeColors.primary },
                ]}
              >
                <Ionicons
                  name={icon.name as keyof typeof Ionicons.glyphMap}
                  size={32}
                  color={
                    selectedIcon === icon.name
                      ? colors.light.white
                      : themeColors.text.primary
                  }
                />
              </View>
              <Text
                style={[
                  styles.iconLabel,
                  { color: themeColors.text.secondary },
                  selectedIcon === icon.name && {
                    color: themeColors.primary,
                    fontFamily: 'PlusJakartaSans-SemiBold',
                  },
                ]}
                numberOfLines={2}
              >
                {icon.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

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
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...typography.styles.h3,
  },
  closeButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typography.styles.body,
  },
  gridContainer: {
    padding: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  iconItem: {
    width: '30.33%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconLabel: {
    ...typography.styles.caption,
    textAlign: 'center',
    fontSize: 10,
  },
});

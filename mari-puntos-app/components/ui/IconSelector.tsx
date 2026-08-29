import React, { useState } from 'react';

import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemedColors } from '@/hooks';
import { borderRadius, shadows, spacing, typography } from '@/theme';

import { PressableScale } from './PressableScale';

const ICON_NAMES = [
  'game-controller-outline',
  'people-outline',
  'football-outline',
  'basketball-outline',
  'beer-outline',
  'wine-outline',
  'fast-food-outline',
  'restaurant-outline',
  'cafe-outline',
  'musical-notes-outline',
  'headset-outline',
  'film-outline',
  'tv-outline',
  'book-outline',
  'bicycle-outline',
  'car-sport-outline',
  'airplane-outline',
  'beach-outline',
  'fitness-outline',
  'barbell-outline',
  'tennisball-outline',
  'golf-outline',
  'baseball-outline',
  'american-football-outline',
  'camera-outline',
  'color-palette-outline',
  'brush-outline',
  'build-outline',
  'hammer-outline',
  'hardware-chip-outline',
  'game-controller',
  'trophy-outline',
  'medal-outline',
  'star-outline',
  'heart-outline',
  'chatbubbles-outline',
  'pizza-outline',
  'ice-cream-outline',
  'leaf-outline',
  'bed-outline',
  'moon-outline',
  'sunny-outline',
  'thunderstorm-outline',
  'umbrella-outline',
  'gift-outline',
  'balloon-outline',
  'sparkles-outline',
  'flame-outline',
] as const;

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
  const { t } = useTranslation(['modals', 'icons']);
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  const themeColors = useThemedColors();

  const iconOptions = ICON_NAMES.map((name) => ({
    name,
    label: t(`icons:${name}`),
  }));

  const filteredIcons = iconOptions.filter(
    (icon) =>
      icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeColors.background,
            paddingTop: Platform.OS !== 'ios' ? insets.top : 0,
          },
        ]}
        accessibilityViewIsModal
      >
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
            {t('iconSelector.title')}
          </Text>
          <PressableScale
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={t('iconSelector.closeA11y')}
          >
            <Ionicons name="close" size={28} color={themeColors.text.primary} />
          </PressableScale>
        </View>

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
            placeholder={t('iconSelector.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={themeColors.gray[400]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.gridContainer}>
          {filteredIcons.map((icon) => (
            <PressableScale
              key={icon.name}
              style={[
                styles.iconItem,
                selectedIcon === icon.name && {
                  backgroundColor: themeColors.background,
                  borderRadius: borderRadius.lg,
                },
              ]}
              onPress={() => handleSelect(icon.name)}
              accessibilityRole="button"
              accessibilityLabel={icon.label}
              accessibilityState={{ selected: selectedIcon === icon.name }}
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
                      ? themeColors.text.white
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
            </PressableScale>
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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

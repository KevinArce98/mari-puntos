import React, { useState } from 'react';

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | number;
  onValueChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onValueChange,
  error,
  disabled = false,
  containerStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const themeColors = useThemedColors();

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: string | number) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: themeColors.text.primary }]}>{label}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          { backgroundColor: themeColors.gray[100], borderColor: themeColors.gray[300] },
          error && { borderColor: themeColors.error },
          disabled && { opacity: 0.5, backgroundColor: themeColors.gray[200] },
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            { color: themeColors.text.primary },
            !selectedOption && { color: themeColors.gray[400] },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={disabled ? themeColors.gray[400] : themeColors.gray[500]}
        />
      </TouchableOpacity>

      {error && <Text style={[styles.error, { color: themeColors.error }]}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.gray[100] }]}>
            <View
              style={[styles.modalHeader, { borderBottomColor: themeColors.gray[200] }]}
            >
              <Text style={[styles.modalTitle, { color: themeColors.text.primary }]}>
                {label || 'Select an option'}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={themeColors.text.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    { borderBottomColor: themeColors.gray[100] },
                    item.value === value && {
                      backgroundColor: themeColors.primary + '10',
                    },
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: themeColors.text.primary },
                      item.value === value && {
                        ...typography.styles.bodyMedium,
                        color: themeColors.primary,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color={themeColors.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.styles.bodyMedium,
    marginBottom: spacing.xs,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  selectText: {
    ...typography.styles.body,
    flex: 1,
  },
  error: {
    ...typography.styles.small,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: borderRadius.xl,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...typography.styles.h3,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  optionText: {
    ...typography.styles.body,
    flex: 1,
  },
});

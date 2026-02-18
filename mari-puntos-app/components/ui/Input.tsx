import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius } from '@/theme';
import { useThemedColors } from '@/hooks';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}) => {
  const colors = useThemedColors();
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const toggleSecure = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.gray[100], borderColor: colors.gray[300] },
          error && { borderColor: colors.error },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.gray[500]}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            { color: colors.text.primary },
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={colors.gray[400]}
          secureTextEntry={isSecure}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecure} style={styles.rightIcon}>
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.gray[500]}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  input: {
    lineHeight: 16,
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginLeft: spacing.md,
  },
  rightIcon: {
    padding: spacing.md,
  },
  error: {
    ...typography.styles.small,
    marginTop: spacing.xs,
  },
});

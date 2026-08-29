import React, { useRef, useState } from 'react';

import { Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';

import { useTranslation } from 'react-i18next';

import { useThemedColors } from '@/hooks';
import { borderRadius, spacing, typography } from '@/theme';

interface CodeInputProps {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  style?: ViewStyle;
  type?: 'numeric' | 'alphanumeric';
  error?: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  value,
  onChangeText,
  style,
  type = 'alphanumeric',
  error = false,
}) => {
  const { t } = useTranslation('common');
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const themeColors = useThemedColors();

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleTextChange = (text: string) => {
    let filteredText = text.slice(0, length);

    if (type === 'numeric') {
      filteredText = filteredText.replace(/[^0-9]/g, '');
    } else {
      filteredText = filteredText.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    onChangeText(filteredText);
  };

  const codeArray = value.split('').concat(Array(length - value.length).fill(''));

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={styles.boxesContainer}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={t('inputs.codeA11y')}
        accessibilityValue={{ text: value || t('inputs.codeEmpty') }}
      >
        {codeArray.slice(0, length).map((char, index) => (
          <View
            key={index}
            accessible={false}
            style={[
              styles.box,
              {
                borderColor: themeColors.gray[300],
                backgroundColor: themeColors.gray[100],
              },
              focused &&
                index === Math.min(value.length, length - 1) && {
                  borderColor: themeColors.primary,
                  borderWidth: 2,
                },
              char && {
                borderColor: themeColors.primary,
                backgroundColor: themeColors.gray[50],
              },
              error && { borderColor: themeColors.error },
            ]}
          >
            <Text style={[styles.boxText, { color: themeColors.text.primary }]}>
              {char}
            </Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleTextChange}
        maxLength={length}
        keyboardType={type === 'numeric' ? 'number-pad' : 'default'}
        autoCapitalize={type === 'alphanumeric' ? 'characters' : 'none'}
        autoComplete={type === 'numeric' ? 'sms-otp' : 'off'}
        textContentType={type === 'numeric' ? 'oneTimeCode' : 'none'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessible={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    width: '100%',
  },
  box: {
    flex: 1,
    minWidth: 36,
    maxWidth: 48,
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    ...typography.styles.h2,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});

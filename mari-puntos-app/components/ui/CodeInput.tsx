import { borderRadius, colors, spacing, typography } from '@/theme';
import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';

interface CodeInputProps {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  style?: ViewStyle;
  type?: 'numeric' | 'alphanumeric';
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  value,
  onChangeText,
  style,
  type = 'alphanumeric',
}) => {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleTextChange = (text: string) => {
    let filteredText = text.slice(0, length);

    if (type === 'numeric') {
      // Solo permitir números
      filteredText = filteredText.replace(/[^0-9]/g, '');
    } else {
      // Permitir letras y números, convertir a mayúsculas
      filteredText = filteredText.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    onChangeText(filteredText);
  };

  const codeArray = value.split('').concat(Array(length - value.length).fill(''));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.boxesContainer}>
        {codeArray.slice(0, length).map((char, index) => (
          <View
            key={index}
            style={[
              styles.box,
              focused && index === value.length && styles.boxFocused,
              char && styles.boxFilled,
            ]}
            onTouchEnd={handlePress}
          >
            <TextInput style={styles.boxText} value={char} editable={false} />
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleTextChange}
        maxLength={length}
        keyboardType={type === 'numeric' ? 'number-pad' : 'default'}
        autoCapitalize={type === 'alphanumeric' ? 'characters' : 'none'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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
    gap: spacing.sm,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.gray[50],
  },
  boxText: {
    ...typography.styles.h2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});

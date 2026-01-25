// filepath: /Users/kevinarias/Projects/mari-puntos-app/components/ui/CodeInput.tsx
import { borderRadius, colors, spacing, typography } from '@/theme';
import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';

interface CodeInputProps {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  style?: ViewStyle;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  value,
  onChangeText,
  style,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handlePress = () => {
    inputRef.current?.focus();
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
            <TextInput
              style={styles.boxText}
              value={char}
              editable={false}
            />
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={(text) => onChangeText(text.toUpperCase().slice(0, length))}
        maxLength={length}
        autoCapitalize="characters"
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

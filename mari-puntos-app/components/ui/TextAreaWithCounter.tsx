import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input, InputProps } from './Input';
import { useThemedColors } from '@/hooks';
import { typography, spacing } from '@/theme';

interface TextAreaWithCounterProps extends InputProps {
  maxLength: number;
  value?: string;
}

export function TextAreaWithCounter({
  maxLength,
  value = '',
  containerStyle,
  ...props
}: TextAreaWithCounterProps) {
  const colors = useThemedColors();
  const currentLength = value?.length ?? 0;
  const isNearLimit = currentLength >= maxLength * 0.9;

  return (
    <View style={containerStyle}>
      <Input
        {...props}
        value={value}
        maxLength={maxLength}
        multiline
        containerStyle={styles.inputContainer}
      />
      <Text
        style={[
          styles.counter,
          { color: isNearLimit ? colors.warning : colors.text.light },
          currentLength >= maxLength && { color: colors.error },
        ]}
      >
        {currentLength}/{maxLength}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing.xs,
  },
  counter: {
    ...typography.styles.small,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
});

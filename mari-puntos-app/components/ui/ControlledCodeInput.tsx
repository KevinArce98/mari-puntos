import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { CodeInput } from './CodeInput';
import { ViewStyle } from 'react-native';

interface ControlledCodeInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  length?: number;
  type?: 'numeric' | 'alphanumeric';
  style?: ViewStyle;
}

export function ControlledCodeInput<T extends FieldValues>({
  control,
  name,
  length = 6,
  type = 'alphanumeric',
  style,
}: ControlledCodeInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <CodeInput
          length={length}
          value={value}
          onChangeText={onChange}
          type={type}
          style={style}
        />
      )}
    />
  );
}

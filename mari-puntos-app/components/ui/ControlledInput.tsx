import React from 'react';

import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

import { Input } from './Input';
import type { InputProps } from './Input';

interface ControlledInputProps<T extends FieldValues> extends Omit<InputProps, 'error'> {
  control: Control<T>;
  name: FieldPath<T>;
}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          {...inputProps}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}

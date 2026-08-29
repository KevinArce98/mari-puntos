import { ComponentProps } from 'react';

import { OpaqueColorValue } from 'react-native';

import { SymbolWeight } from 'expo-symbols';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type MaterialIconProps = ComponentProps<typeof MaterialIcons>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: MaterialIconProps['style'];
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}

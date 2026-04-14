/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { colors } from '@/theme/colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Permite acceder a cualquier color definido en la paleta extendida para light/dark.
 * colorPath puede ser 'text.primary', 'gray.200', etc.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorPath: string
) {
  const scheme = useColorScheme();
  const theme: 'light' | 'dark' = scheme === 'dark' ? 'dark' : 'light';
  const colorFromProps = props[theme];
  if (colorFromProps) {
    return colorFromProps;
  }
  // Permite acceder a propiedades anidadas como 'text.primary', 'gray.200', etc.
  const segments = colorPath.split('.');
  let value: any = colors[theme];
  for (const seg of segments) {
    if (value && seg in value) {
      value = value[seg];
    } else {
      value = undefined;
      break;
    }
  }
  return value;
}

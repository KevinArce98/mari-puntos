/**
 * Hook to access themed colors based on current color scheme (light/dark)
 */
import { colors } from '@/theme/colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Appearance } from 'react-native';

export function useThemedColors() {
  const scheme = useColorScheme() ?? Appearance.getColorScheme();
  const colorScheme: 'light' | 'dark' = scheme === 'dark' ? 'dark' : 'light';
  return colors[colorScheme];
}

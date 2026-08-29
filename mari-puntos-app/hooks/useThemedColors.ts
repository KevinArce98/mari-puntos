import { Appearance } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { colors } from '@/theme/colors';

export function useThemedColors() {
  const scheme = useColorScheme() ?? Appearance.getColorScheme();
  const colorScheme: 'light' | 'dark' = scheme === 'dark' ? 'dark' : 'light';
  return colors[colorScheme];
}

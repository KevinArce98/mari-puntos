/**
 * Hook to access themed colors based on current color scheme (light/dark)
 */
import { colors } from '@/theme/colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemedColors() {
  const colorScheme = useColorScheme() ?? 'light';

  // Return the appropriate color palette based on the theme
  return colors[colorScheme] || colors.light;
}

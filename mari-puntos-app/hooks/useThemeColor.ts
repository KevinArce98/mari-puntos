import { useColorScheme } from '@/hooks/useColorScheme';
import { colors } from '@/theme/colors';

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

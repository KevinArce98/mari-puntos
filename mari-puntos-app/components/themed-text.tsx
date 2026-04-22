import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { typography } from '@/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text.primary');
  const linkColor = useThemeColor({}, 'primary');

  return (
    <Text
      style={[
        { color: type === 'link' ? linkColor : color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...typography.styles.bodyLarge,
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: typography.fontFamily.semiBold,
    lineHeight: 24,
  },
  title: {
    ...typography.styles.h1,
  },
  subtitle: {
    ...typography.styles.h2,
  },
  link: {
    ...typography.styles.bodyLarge,
  },
});

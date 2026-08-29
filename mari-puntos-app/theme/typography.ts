import { TextStyle } from 'react-native';

export const typography = {
  fontFamily: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 48,
    '6xl': 64,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  styles: {
    display: {
      fontSize: 34,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 40,
      fontVariant: ['tabular-nums'],
    } as TextStyle,

    h1: {
      fontSize: 28,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 34,
    } as TextStyle,

    h2: {
      fontSize: 22,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 28,
    } as TextStyle,

    h3: {
      fontSize: 17,
      fontFamily: 'PlusJakartaSans-SemiBold',
      lineHeight: 24,
    } as TextStyle,

    h4: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-SemiBold',
      lineHeight: 22,
    } as TextStyle,

    body: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-Regular',
      lineHeight: 24,
    } as TextStyle,

    bodyMedium: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-Medium',
      lineHeight: 24,
    } as TextStyle,

    bodyLarge: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-Regular',
      lineHeight: 24,
    } as TextStyle,

    bodySm: {
      fontSize: 14,
      fontFamily: 'PlusJakartaSans-Regular',
      lineHeight: 20,
    } as TextStyle,

    caption: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-Medium',
      lineHeight: 16,
    } as TextStyle,

    small: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-Regular',
      lineHeight: 16,
    } as TextStyle,

    button: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-SemiBold',
      lineHeight: 24,
    } as TextStyle,

    buttonSmall: {
      fontSize: 14,
      fontFamily: 'PlusJakartaSans-SemiBold',
      lineHeight: 20,
    } as TextStyle,

    pointsLarge: {
      fontSize: 56,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 64,
      fontVariant: ['tabular-nums'],
    } as TextStyle,

    pointsMedium: {
      fontSize: 44,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 52,
      fontVariant: ['tabular-nums'],
    } as TextStyle,
  },
};

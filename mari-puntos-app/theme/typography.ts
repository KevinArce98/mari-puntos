import { TextStyle } from 'react-native';

export const typography = {
  // Font families - Plus Jakarta Sans from Design System
  fontFamily: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },

  // Font sizes from Design System
  fontSize: {
    xs: 12,
    sm: 14, // Body text
    base: 16,
    lg: 18,
    xl: 20, // Heading 2
    '2xl': 24,
    '3xl': 30, // Heading 1
    '4xl': 36,
    '5xl': 48,
    '6xl': 64, // Large points display
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Text styles presets matching Design System
  styles: {
    // Heading 1 - Plus Jakarta Sans / Bold / 30px
    h1: {
      fontSize: 30,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 36,
    } as TextStyle,

    // Heading 2 - Plus Jakarta Sans / Bold / 20px
    h2: {
      fontSize: 20,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 24,
    } as TextStyle,

    h3: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-SemiBold',
      lineHeight: 22,
    } as TextStyle,

    h4: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-SemiBold',
      lineHeight: 20,
    } as TextStyle,

    // Body Text - Plus Jakarta Sans / Regular / 14px
    body: {
      fontSize: 14,
      fontFamily: 'PlusJakartaSans-Regular',
      lineHeight: 21,
    } as TextStyle,

    bodyMedium: {
      fontSize: 14,
      fontFamily: 'PlusJakartaSans-Medium',
      lineHeight: 21,
    } as TextStyle,

    bodyLarge: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-Regular',
      lineHeight: 24,
    } as TextStyle,

    caption: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-Regular',
      lineHeight: 18,
    } as TextStyle,

    small: {
      fontSize: 10,
      fontFamily: 'PlusJakartaSans-Regular',
      lineHeight: 14,
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

    // Large points display
    pointsLarge: {
      fontSize: 64,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 72,
    } as TextStyle,

    pointsMedium: {
      fontSize: 48,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 56,
    } as TextStyle,
  },
};

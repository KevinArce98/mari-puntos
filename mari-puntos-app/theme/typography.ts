import { TextStyle } from 'react-native';

export const typography = {
  // Font families - Plus Jakarta Sans from Design System
  fontFamily: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },

  // Font sizes v2 - body mínimo 16 en móvil
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16, // Body text
    lg: 18,
    xl: 22, // Heading 2
    '2xl': 24,
    '3xl': 28, // Heading 1
    '4xl': 34, // Display
    '5xl': 48,
    '6xl': 64, // Large points display
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Text styles presets - Design System v2
  styles: {
    // Display - números de puntos (tabular para evitar saltos de layout)
    display: {
      fontSize: 34,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 40,
      fontVariant: ['tabular-nums'],
    } as TextStyle,

    // Heading 1 - título de pantalla
    h1: {
      fontSize: 28,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 34,
    } as TextStyle,

    // Heading 2 - sección grande
    h2: {
      fontSize: 22,
      fontFamily: 'PlusJakartaSans-Bold',
      lineHeight: 28,
    } as TextStyle,

    // Heading 3 - título de card
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

    // Body - 16px mínimo móvil
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

    // Texto secundario compacto (listas densas, metadatos largos)
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

    // 12px es el mínimo del sistema (antes 10px)
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

    // Large points display
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

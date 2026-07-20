export const colors = {
  light: {
    // Design System v2 - MariPuntos Color Palette
    primary: '#0F766E', // Teal 700 (5.7:1 sobre blanco)
    primaryDark: '#115E59', // Teal 800
    primaryTint: '#F0FDFA', // Teal 50 - fondos tonales (botón secundario, chips)
    accent: '#D97706', // Amber 600 - SOLO logros, trofeos y niveles
    love: '#FB7185', // Rose 400 - momentos de pareja: racha, duelo, romance
    white: '#FFFFFF',
    background: '#FAFAF9', // Stone 50
    surface: '#FFFFFF', // Cards - siempre más claras que el fondo
    border: '#E7E5E4', // Stone 200 - separación de cards

    // Text colors
    text: {
      primary: '#1C1917',
      secondary: '#57534E', // Stone 600 (7.3:1)
      light: '#78716C', // Stone 500 (4.5:1) - mínimo permitido
      white: '#FFFFFF',
    },

    // States
    success: '#16A34A',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',

    // Grays - warm neutrals (stone)
    gray: {
      50: '#FAFAF9',
      100: '#F5F5F4',
      200: '#E7E5E4',
      300: '#D6D3D1',
      400: '#A8A29E',
      500: '#78716C',
      600: '#57534E',
      700: '#44403C',
      800: '#292524',
      900: '#1C1917',
    },

    // Transparencies
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',

    // Gamification levels
    level: {
      bronze: '#B45309',
      silver: '#78716C',
      gold: '#D97706',
      platinum: '#57534E',
      diamond: '#0891B2',
    },

    // Category colors for actions (sistema único, tonos de igual saturación)
    category: {
      chores: '#0EA5E9', // Sky
      romance: '#FB7185', // Rose
      gifts: '#A78BFA', // Violet
      activities: '#F59E0B', // Amber
      naughty: '#F43F5E', // Red rose
    },

    // Points colors
    points: {
      positive: '#0F766E',
      negative: '#DC2626',
    },

    // Streak states
    streak: {
      active: '#F97316', // Orange 500 - racha completada
      warm: '#FBBF24', // Amber 400 - racha en curso
    },

    // Action category icon colors (alineado al sistema de categorías)
    actionCategory: {
      childcare: '#FB7185',
      errands: '#F59E0B',
      romantic: '#F43F5E',
      personalGrowth: '#A78BFA',
    },
  },

  dark: {
    // Dark diseñado (no invertido): primario desaturado sobre superficies cálidas
    primary: '#2DD4BF', // Teal 400
    primaryDark: '#14B8A6', // Teal 500
    primaryTint: '#134E4A', // Teal 900 - fondo tonal en oscuro
    accent: '#F59E0B', // Amber 500 - más luminoso sobre oscuro
    love: '#FB7185',
    white: '#1C1917', // Superficie (compat: se usa como bg de cards)
    background: '#0C0A09',
    surface: '#1C1917',
    border: '#292524',

    text: {
      primary: '#FAFAF9',
      secondary: '#A8A29E',
      light: '#78716C',
      white: '#FFFFFF',
    },

    success: '#4ADE80',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',

    gray: {
      50: '#1C1917',
      100: '#292524',
      200: '#38332F',
      300: '#44403C',
      400: '#78716C',
      500: '#A8A29E',
      600: '#D6D3D1',
      700: '#E7E5E4',
      800: '#F5F5F4',
      900: '#FAFAF9',
    },

    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',

    level: {
      bronze: '#D97706',
      silver: '#A8A29E',
      gold: '#FBBF24',
      platinum: '#D6D3D1',
      diamond: '#22D3EE',
    },

    category: {
      chores: '#38BDF8',
      romance: '#FDA4AF',
      gifts: '#C4B5FD',
      activities: '#FBBF24',
      naughty: '#FB7185',
    },

    points: {
      positive: '#2DD4BF',
      negative: '#F87171',
    },

    streak: {
      active: '#FB923C',
      warm: '#FCD34D',
    },

    actionCategory: {
      childcare: '#FDA4AF',
      errands: '#FBBF24',
      romantic: '#FB7185',
      personalGrowth: '#C4B5FD',
    },
  },
};

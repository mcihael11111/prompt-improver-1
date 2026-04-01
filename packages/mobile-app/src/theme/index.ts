export const colors = {
  primary: '#7616d0',
  primaryHigh: '#a96ee2',
  primaryMedium: '#cba9ee',
  primaryLowest: '#ede3fa',
  white: '#ffffff',
  bgSubtle: '#fbf7ff',
  textDark: '#1e293b',
  textLight: '#323232',
  textMuted: '#94a3b8',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 24,
  full: 9999,
};

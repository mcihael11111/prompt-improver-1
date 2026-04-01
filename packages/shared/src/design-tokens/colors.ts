export const colors = {
  primary: {
    highest: '#7616d0',
    high: '#a96ee2',
    medium: '#cba9ee',
    lowest: '#ede3fa',
  },
  secondary: {
    highest: '#ffffff',
    high: '#fbf7ff',
  },
  text: {
    dark: '#1e293b',
    light: '#323232',
    muted: '#94a3b8',
  },
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

/** CSS custom properties string for injection into Shadow DOM */
export const colorsCssVars = `
  --tc-primary-highest: ${colors.primary.highest};
  --tc-primary-high: ${colors.primary.high};
  --tc-primary-medium: ${colors.primary.medium};
  --tc-primary-lowest: ${colors.primary.lowest};
  --tc-secondary-highest: ${colors.secondary.highest};
  --tc-secondary-high: ${colors.secondary.high};
  --tc-text-dark: ${colors.text.dark};
  --tc-text-light: ${colors.text.light};
  --tc-text-muted: ${colors.text.muted};
  --tc-success: ${colors.semantic.success};
  --tc-warning: ${colors.semantic.warning};
  --tc-error: ${colors.semantic.error};
  --tc-info: ${colors.semantic.info};
`;

// Noor App Theme Colors (Serene Sanctuary palette with Dark Mode support)

export const LightColors = {
  primary: '#002721',
  primaryLight: '#034138',
  primaryContainer: '#003830',
  secondary: '#fe932c',
  secondaryLight: '#ffeedd',
  secondaryContainer: '#ffe0b2',
  surface: '#ffffff',
  surfaceDim: '#f8faf9',
  surfaceContainer: '#f1f5f3',
  surfaceBorder: '#e2e8e5',
  cardBg: '#ffffff',
  onSurface: '#191c1b',
  onSurfaceVariant: '#6f7975',
  textSecondary: '#6b7280',
  error: '#ba1a1a',
  success: '#006c4c',
  navBg: '#ffffff',
  navBorder: '#f1f5f3',
  isDark: false,
};

export const DarkColors = {
  primary: '#064e3b',
  primaryLight: '#0d6952',
  primaryContainer: '#032c21',
  secondary: '#fe932c',
  secondaryLight: '#3d2005',
  secondaryContainer: '#261202',
  surface: '#0d1620',
  surfaceDim: '#070c12',
  surfaceContainer: '#152232',
  surfaceBorder: '#223447',
  cardBg: '#131e2c',
  onSurface: '#f1f5f9',
  onSurfaceVariant: '#94a3b8',
  textSecondary: '#94a3b8',
  error: '#f87171',
  success: '#34d399',
  navBg: '#0d1620',
  navBorder: '#223447',
  isDark: true,
};

export const Colors = LightColors;

export const getThemeColors = (isDark = false) => (isDark ? DarkColors : LightColors);

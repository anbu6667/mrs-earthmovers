export const TOKENS = {
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  shadow: {
    strong: {
      // Shadows removed to prevent black "outline/highlight" on Android navigation/press.
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    soft: {
      // Shadows removed to prevent black "outline/highlight" on Android navigation/press.
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
  },
};

export const PREMIUM_DARK = {
  // Softer "premium" dark: deep navy/charcoal (less pure black)
  bg: '#0F172A',
  bg2: '#111C33',
  surface: 'rgba(255,255,255,0.09)',
  surface2: 'rgba(255,255,255,0.13)',
  border: 'rgba(255,255,255,0.16)',
  text: '#F3F6FB',
  muted: 'rgba(243,246,251,0.78)',
  subtle: 'rgba(243,246,251,0.56)',
  accent: '#FF8A00',
  accentSoft: 'rgba(255,138,0,0.16)',
  success: '#2ED47A',
  danger: '#FF4D4F',
  info: '#4DA3FF',
};

export const PREMIUM_LIGHT = {
  // Light, orange-forward theme (white surfaces + warm background)
  bg: '#FFF7F0',
  bg2: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#FFFFFF',
  border: 'rgba(15,23,42,0.10)',
  text: '#0F172A',
  muted: 'rgba(15,23,42,0.62)',
  subtle: 'rgba(15,23,42,0.42)',
  accent: '#FF8A00',
  accentSoft: 'rgba(255,138,0,0.12)',
  success: '#2ED47A',
  danger: '#FF4D4F',
  info: '#2F80ED',
};

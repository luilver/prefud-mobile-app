import { StyleSheet } from 'react-native';

export const FONT_LOGO = 'Pacifico';
export const FONT_UI = 'Montserrat';

export const PALETTES = {
  default: {
    primary: '#186047',
    accent: '#A4B237',
    background: '#F7F6F1',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onBackground: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    error: '#EF4444',
  },
  citrus: {
    primary: '#FF7F50',
    accent: '#32CD32',
    background: '#FFF8F0',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onBackground: '#0F172A',
    muted: '#64748B',
    border: '#FDE6D1',
    success: '#10B981',
    error: '#EF4444',
  },
  aqua: {
    primary: '#008080',
    accent: '#87CEEB',
    background: '#F0FAFA',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onBackground: '#0F172A',
    muted: '#64748B',
    border: '#D1EAEA',
    success: '#10B981',
    error: '#EF4444',
  },
  dusk: {
    primary: '#800080',
    accent: '#B87333',
    background: '#FAF5FA',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onBackground: '#0F172A',
    muted: '#64748B',
    border: '#ECDCEC',
    success: '#10B981',
    error: '#EF4444',
  },
};

export const THEME_NAME = 'default';

export const colors = PALETTES[THEME_NAME];

export const text = {
  h1: { fontFamily: FONT_UI, fontWeight: '700', fontSize: 32, color: colors.onBackground },
  h2: { fontFamily: FONT_UI, fontWeight: '700', fontSize: 28, color: colors.onBackground },
  h3: { fontFamily: FONT_UI, fontWeight: '700', fontSize: 24, color: colors.onBackground },
  h4: { fontFamily: FONT_UI, fontWeight: '500', fontSize: 20, color: colors.onBackground },
  h5: { fontFamily: FONT_UI, fontWeight: '500', fontSize: 18, color: colors.onBackground },
  h6: { fontFamily: FONT_UI, fontWeight: '500', fontSize: 16, color: colors.onBackground },
  body: { fontFamily: FONT_UI, fontWeight: '400', fontSize: 16, color: colors.onBackground },
  bodyMuted: { fontFamily: FONT_UI, fontWeight: '400', fontSize: 16, color: colors.muted },
  label: { fontFamily: FONT_UI, fontWeight: '500', fontSize: 14, color: colors.onBackground },
  button: { fontFamily: FONT_UI, fontWeight: '600', fontSize: 16, color: colors.onPrimary },
  logo: { fontFamily: FONT_LOGO, fontSize: 32, color: colors.primary },
};

export const spacing = { xs: 6, sm: 12, md: 24, lg: 32, xl: 48 };
export const radius = { sm: 8, md: 10, lg: 12, pill: 999 };

export const makeStyles = (styles) => StyleSheet.create(styles);

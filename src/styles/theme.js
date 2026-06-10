import { createTheme } from '@mui/material/styles';

const palette = {
  primary: '#6C63FF',
  secondary: '#8B5CF6',
  background: '#F5F7FF',
  dark: '#111827',
  card: '#FFFFFF',
  textDark: '#1F2937',
  textLight: '#6B7280',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const buildTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: { main: palette.primary },
      secondary: { main: palette.secondary },
      success: { main: palette.success },
      error: { main: palette.danger },
      warning: { main: palette.warning },
      background: {
        default: mode === 'light' ? palette.background : palette.dark,
        paper: mode === 'light' ? palette.card : '#1F2937',
      },
      text: {
        primary: mode === 'light' ? palette.textDark : '#F9FAFB',
        secondary: mode === 'light' ? palette.textLight : '#CBD5E1',
      },
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { boxShadow: 'none', borderRadius: 8 },
          containedPrimary: {
            background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

export const colors = palette;

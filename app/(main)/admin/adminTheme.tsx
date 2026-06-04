import { defaultTheme } from 'react-admin';

export const darkCyanTheme = {
  ...defaultTheme,
  palette: {
    mode: 'dark' as const,
    primary: { main: '#00E5FF' },
    secondary: { main: '#00E5FF' },
    background: {
      default: '#0a0e14',
      paper: '#0d1117',
    },
    text: {
      primary: '#ffffff',
      secondary: '#3a4a5a',
    },
  },
  components: {
    ...defaultTheme.components,
    MuiPaper: {
      styleOverrides: {
        root: { border: '1px solid #1e2530', backgroundImage: 'none' },
      },
    },
  },
};
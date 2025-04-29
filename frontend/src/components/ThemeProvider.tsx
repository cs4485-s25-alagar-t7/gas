import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: 'hsl(222.2 47.4% 11.2%)',
    },
    secondary: {
      main: 'hsl(210 40% 96.1%)',
    },
    background: {
      default: 'hsl(0 0% 100%)',
      paper: 'hsl(0 0% 100%)',
    },
  },
  typography: {
    fontFamily: 'inherit',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
} 
import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#ff692d',
    },
    secondary: {
      main: '#1cc29f',
    },
    success: {
      main: '#30a46c',
    },
    error: {
      main: '#e63731',
    },
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

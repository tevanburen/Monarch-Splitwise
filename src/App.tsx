import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Widget } from './components';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Widget />
    </ThemeProvider>
  );
};

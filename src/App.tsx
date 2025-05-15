import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Widget } from './components';
import { PageContextProvider } from './api';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageContextProvider>
        <Widget />
      </PageContextProvider>
    </ThemeProvider>
  );
};

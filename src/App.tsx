import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { LocalStorageContextProvider, Widget } from './components';
import { PageContextProvider } from './api';

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageContextProvider>
        <LocalStorageContextProvider>
          <Widget />
        </LocalStorageContextProvider>
      </PageContextProvider>
    </ThemeProvider>
  );
};

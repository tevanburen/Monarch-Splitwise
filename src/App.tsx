import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';
import { LocalStorageContextProvider, Widget } from './components';
import { PageContextProvider } from './api';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PageContextProvider>
          <LocalStorageContextProvider>
            <Widget />
          </LocalStorageContextProvider>
        </PageContextProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

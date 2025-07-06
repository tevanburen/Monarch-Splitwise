import {
  CssBaseline,
  styled,
  StyledEngineProvider,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { theme } from './theme';

// export const App = () => {
//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <PageContextProvider>
//           <LocalStorageContextProvider>
//             <LoadingScreenContextProvider>
//               <Widget />
//             </LoadingScreenContextProvider>
//           </LocalStorageContextProvider>
//         </PageContextProvider>
//       </ThemeProvider>
//     </LocalizationProvider>
//   );
// };

const ResetDiv = styled('div')({
  all: 'initial',
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.fontSize,
  lineHeight: theme.typography.body1.lineHeight,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
  boxSizing: 'border-box',
});

export const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* <ResetDiv> */}
        <Typography variant="h6">Hello</Typography>
        {/* </ResetDiv> */}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

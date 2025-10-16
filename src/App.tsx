import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme";
import { LocalStorageContextProvider, Widget } from "./components";
import { PageContextProvider } from "./api";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LoadingScreenContextProvider } from "./components/LoadingScreenProvider";

export const App = () => {
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<PageContextProvider>
					<LocalStorageContextProvider>
						<LoadingScreenContextProvider>
							<Widget />
						</LoadingScreenContextProvider>
					</LocalStorageContextProvider>
				</PageContextProvider>
			</ThemeProvider>
		</LocalizationProvider>
	);
};

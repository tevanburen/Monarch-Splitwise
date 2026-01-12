// import { CssBaseline, ThemeProvider } from "@mui/material";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { PageContextProvider } from "./api";
// import { LocalStorageContextProvider, Widget } from "./components";
// import { LoadingScreenContextProvider } from "./components/LoadingScreenProvider";
// import { theme } from "./theme";
import "./index.css";

export const App = () => {
	return (
		<div>TVB EXTENSION</div>
		// <LocalizationProvider dateAdapter={AdapterDayjs}>
		// 	<ThemeProvider theme={theme}>
		// 		<CssBaseline />
		// 		<PageContextProvider>
		// 			<LocalStorageContextProvider>
		// 				<LoadingScreenContextProvider>
		// 					<Widget />
		// 				</LoadingScreenContextProvider>
		// 			</LocalStorageContextProvider>
		// 		</PageContextProvider>
		// 	</ThemeProvider>
		// </LocalizationProvider>
	);
};

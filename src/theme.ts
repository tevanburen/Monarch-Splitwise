import { createTheme } from "@mui/material";

const monarchOrange = "#ff692d";
const splitwiseGreen = "#1cc29f";

export const theme = createTheme({
	palette: {
		primary: {
			main: monarchOrange,
		},
		secondary: {
			main: splitwiseGreen,
		},
		success: {
			main: splitwiseGreen,
		},
		error: {
			main: monarchOrange,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
				},
			},
		},
	},
});

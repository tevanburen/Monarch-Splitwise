import { PageContextProvider } from "./api";
import { Widget } from "./components";
import { LoadingScreenProvider, LocalStorageProvider } from "./providers";

/**
 * Root application component that sets up all context providers and renders the main widget.
 *
 * @component
 */
export const App = () => {
	return (
		<PageContextProvider>
			<LocalStorageProvider>
				<LoadingScreenProvider>
					<Widget />
				</LoadingScreenProvider>
			</LocalStorageProvider>
		</PageContextProvider>
	);
};

import { PageContextProvider } from "./api";
import { LocalStorageContextProvider, Widget } from "./components";
import { LoadingScreenContextProvider } from "./components/LoadingScreenProvider";

/**
 * Root application component that sets up all context providers and renders the main widget.
 *
 * @component
 */
export const App = () => {
	return (
		<PageContextProvider>
			<LocalStorageContextProvider>
				<LoadingScreenContextProvider>
					<Widget />
				</LoadingScreenContextProvider>
			</LocalStorageContextProvider>
		</PageContextProvider>
	);
};

import { Widget } from "./components";
import {
	LoadingScreenProvider,
	LocalStorageProvider,
	PageContextProvider,
} from "./providers";

/**
 * Root application component that sets up all context providers and renders the main widget.
 *
 * @component
 */
export const InnerApp = () => {
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

import { PageContextProvider } from "./api";
import { LocalStorageContextProvider, Widget } from "./components";
import { LoadingScreenContextProvider } from "./components/LoadingScreenProvider";

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

import { Loader2 } from "lucide-react";
import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";

/**
 * Context interface for managing loading screen state across the application.
 */
interface LoadingScreenContextComponents {
	isLoading: boolean;
	toggleLoading: ((loading?: true) => number) &
		((loading: false, loadingKey: number) => void);
	clearLoading: () => void;
}

const LoadingScreenContext = createContext<
	LoadingScreenContextComponents | undefined
>(undefined);

/**
 * Hook to access the loading screen context.
 *
 * @throws Error if used outside of LoadingScreenContextProvider
 * @returns Loading screen context with state and toggle functions
 */
export const useLoadingScreenContext = (): LoadingScreenContextComponents => {
	const context = useContext(LoadingScreenContext);
	if (!context) {
		throw new Error(
			"useLoadingScreenContext must be used within a LoadingScreenContextProvider",
		);
	}
	return context;
};

/**
 * Provider component that manages global loading screen state.
 * Uses a keying system to ensure multiple concurrent operations can safely toggle loading state.
 *
 * @component
 */
export const LoadingScreenContextProvider = ({
	children,
}: PropsWithChildren) => {
	/**
	 * State
	 */
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const loadingRef = useRef<number>(0);

	/**
	 * Functions
	 */

	/**
	 * Toggles the loading screen on or off with a keying mechanism.
	 * When turning on, returns a unique key to later turn it off safely.
	 * When turning off, requires the matching key to prevent race conditions.
	 *
	 * @param loading - True to show loading screen, false to hide it
	 * @param loadingKey - Required when loading=false, must match the key from when loading was enabled
	 * @returns The loading key when enabling, 0 when disabling
	 */
	const toggleLoading: ((loading?: true) => number) &
		((loading: false, loadingKey: number) => number) = useCallback(
		(loading: boolean = true, loadingKey?: number) => {
			if (loading) {
				setIsLoading(true);
				return ++loadingRef.current;
			} else if (loadingKey === loadingRef.current) {
				setIsLoading(false);
			}
			return 0;
		},
		[],
	);

	/**
	 * Force clears the loading screen regardless of the current key state.
	 */
	const clearLoading = useCallback(() => setIsLoading(false), []);

	return (
		<LoadingScreenContext.Provider
			value={
				{
					isLoading,
					toggleLoading,
					clearLoading,
				} satisfies LoadingScreenContextComponents
			}
		>
			{children}
			{isLoading && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center pointer-events-auto">
					<Loader2 className="size-8 text-primary animate-spin" />
				</div>
			)}
		</LoadingScreenContext.Provider>
	);
};

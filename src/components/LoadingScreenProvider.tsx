import { Loader2 } from "lucide-react";
import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";

interface LoadingScreenContextComponents {
	isLoading: boolean;
	toggleLoading: ((loading?: true) => number) &
		((loading: false, loadingKey: number) => void);
	clearLoading: () => void;
}

const LoadingScreenContext = createContext<
	LoadingScreenContextComponents | undefined
>(undefined);

export const useLoadingScreenContext = (): LoadingScreenContextComponents => {
	const context = useContext(LoadingScreenContext);
	if (!context) {
		throw new Error(
			"useLoadingScreenContext must be used within a LoadingScreenContextProvider",
		);
	}
	return context;
};

export const LoadingScreenContextProvider = ({
	children,
}: PropsWithChildren) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const loadingRef = useRef<number>(0);

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

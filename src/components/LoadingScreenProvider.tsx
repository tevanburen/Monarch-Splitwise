import { Box, CircularProgress, styled } from "@mui/material";
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

const StyledBox = styled(Box)({
	position: "fixed",
	top: 0,
	left: 0,
	width: "100vw",
	height: "100vh",
	backgroundColor: "rgba(0, 0, 0, 0.5)",
	zIndex: 1300,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	pointerEvents: "all",
});

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
				<StyledBox>
					<CircularProgress color="primary" />
				</StyledBox>
			)}
		</LoadingScreenContext.Provider>
	);
};

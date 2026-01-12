import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { CornerPosition, TvbAccount } from "@/types";

/**
 * Fields stored in local storage for the application.
 */
interface LocalStorageFields {
	tvbAccounts: TvbAccount[];
	cornerPosition: CornerPosition;
	splitwiseName: string;
}
/**
 * Context interface extending LocalStorageFields with setters and loading state.
 */ interface LocalStorageContextComponents extends LocalStorageFields {
	setLocalStorage: (field: keyof LocalStorageFields, value: unknown) => void;
	isLocalStorageLoading: boolean;
}

const localStorageContext = createContext<
	LocalStorageContextComponents | undefined
>(undefined);

/**
 * Hook to access the local storage context.
 *
 * @throws Error if used outside of LocalStorageContextProvider
 * @returns Local storage context with current values and setter function
 */
export const useLocalStorageContext = (): LocalStorageContextComponents => {
	const context = useContext(localStorageContext);
	if (!context) {
		throw new Error(
			"useLocalStorageContext must be used within a LocalStorageContextProvider",
		);
	}
	return context;
};

const localStorageId = "MonarchSplitwiseLocalStorage";

/**
 * Provider component that manages application settings via local storage.
 * Handles accounts, widget position, and Splitwise user name.
 *
 * @component
 */
export const LocalStorageContextProvider = ({
	children,
}: PropsWithChildren) => {
	/**
	 * State
	 */
	const [tvbAccounts, setTvbAccounts] = useState<TvbAccount[]>([]);
	const [cornerPosition, setCornerPosition] = useState<CornerPosition>("right");
	const [splitwiseName, setSplitswiseName] = useState<string>("");
	const [isLocalStorageLoading, setIsLocalStorageLoading] =
		useState<boolean>(true);

	/**
	 * Functions
	 */

	/**
	 * Fetches and parses data from local storage, updating component state.
	 * Sorts accounts alphabetically by Monarch name.
	 */
	const fetchLocalStorage = useCallback(() => {
		setIsLocalStorageLoading(true);
		const ls: LocalStorageContextComponents | null = JSON.parse(
			localStorage.getItem(localStorageId) ?? "null",
		);
		setTvbAccounts(
			ls?.tvbAccounts?.sort((a, b) =>
				a.monarchName.localeCompare(b.monarchName),
			) ?? [],
		);
		setCornerPosition(ls?.cornerPosition ?? "right");
		setSplitswiseName(ls?.splitwiseName ?? "");
		setIsLocalStorageLoading(false);
	}, []);

	/**
	 * Updates a specific field in local storage and refreshes the context state.
	 *
	 * @param field - The field name to update
	 * @param value - The new value for the field
	 */
	const setLocalStorage = useCallback(
		(field: string, value: unknown) => {
			localStorage.setItem(
				localStorageId,
				JSON.stringify({
					...JSON.parse(localStorage.getItem(localStorageId) ?? "null"),
					[field]: value,
				}),
			);
			fetchLocalStorage();
		},
		[fetchLocalStorage],
	);

	/**
	 * Effects
	 */
	useEffect(() => {
		fetchLocalStorage();
	}, [fetchLocalStorage]);

	return (
		<localStorageContext.Provider
			value={{
				tvbAccounts,
				setLocalStorage,
				isLocalStorageLoading,
				cornerPosition,
				splitwiseName,
			}}
		>
			{children}
		</localStorageContext.Provider>
	);
};

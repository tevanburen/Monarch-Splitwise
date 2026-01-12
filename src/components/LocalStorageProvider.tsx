import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { CornerPosition, TvbAccount } from "@/types";

interface LocalStorageFields {
	tvbAccounts: TvbAccount[];
	cornerPosition: CornerPosition;
}

interface LocalStorageContextComponents extends LocalStorageFields {
	setLocalStorage: (field: keyof LocalStorageFields, value: unknown) => void;
	isLocalStorageLoading: boolean;
}

const localStorageContext = createContext<
	LocalStorageContextComponents | undefined
>(undefined);

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

export const LocalStorageContextProvider = ({
	children,
}: PropsWithChildren) => {
	const [tvbAccounts, setTvbAccounts] = useState<TvbAccount[]>([]);
	const [cornerPosition, setCornerPosition] = useState<CornerPosition>("right");
	const [isLocalStorageLoading, setIsLocalStorageLoading] =
		useState<boolean>(true);

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
		setIsLocalStorageLoading(false);
	}, []);

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
			}}
		>
			{children}
		</localStorageContext.Provider>
	);
};

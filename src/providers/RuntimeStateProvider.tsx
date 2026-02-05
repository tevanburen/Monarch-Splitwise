import {
	createContext,
	type Dispatch,
	type PropsWithChildren,
	type SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type {
	BackgroundState,
	BackgroundStateTempData,
	GetStateMessage,
	UpdateStateMessage,
	UpdateStateMessagePayload,
	WidgetLocation,
	WidgetStatus,
} from "@/types";

/**
 * Runtime state synchronized with background service worker
 */
interface RuntimeStateContextComponents {
	initializationError: boolean;
	clickNumber: number;
	lastSynced: number;
	tempLocation: WidgetLocation;
	status: WidgetStatus;
	updateSingleTempState: <T>(
		field: keyof BackgroundStateTempData,
		value: T | ((prev: T) => T),
	) => void;
	runDriver: () => void;
}

const RuntimeStateContext = createContext<
	RuntimeStateContextComponents | undefined
>(undefined);

/**
 * Hook to access runtime state context
 *
 * @throws Error if used outside of RuntimeStateContextProvider
 * @returns Runtime state context
 */
export const useRuntimeStateContext = (): RuntimeStateContextComponents => {
	const context = useContext(RuntimeStateContext);
	if (!context) {
		throw new Error(
			"useRuntimeStateContext must be used within a RuntimeStateContextProvider",
		);
	}
	return context;
};

/**
 * Provider that synchronizes state with background service worker.
 * Listens for state updates from background and propagates to all consumers.
 *
 * @component
 */
export const RuntimeStateProvider = ({ children }: PropsWithChildren) => {
	/**
	 * State - synced with background script
	 */
	const [initializationError, setInitializationError] =
		useState<boolean>(false);

	// syncData
	const [lastSynced, setLastSynced] = useState<number>(0);

	// tempData
	const [tempLocation, setTempLocation] = useState<WidgetLocation>("left");
	const [status, setStatus] = useState<WidgetStatus>("idle");
	const [clickNumber, setClickNumber] = useState<number>(0);

	/**
	 * Sync State
	 */
	const syncState = useCallback((state: UpdateStateMessagePayload) => {
		if (state.syncData) {
			if (state.syncData.lastSynced !== undefined) {
				setLastSynced(state.syncData.lastSynced);
			}
		}
		if (state.tempData) {
			if (state.tempData.tempLocation !== undefined) {
				setTempLocation(state.tempData.tempLocation);
			}
			if (state.tempData.status !== undefined) {
				setStatus(state.tempData.status);
			}
			if (state.tempData.clickNumber !== undefined) {
				setClickNumber(state.tempData.clickNumber);
			}
		}
	}, []);

	/**
	 * Initialize state from background on mount
	 */
	useEffect(() => {
		const loadData = async () => {
			try {
				const state: BackgroundState = await chrome.runtime.sendMessage({
					type: "GET_STATE_MESSAGE",
				} satisfies GetStateMessage);
				if (!state.tempData || !state.syncData)
					throw new Error("Incomplete state from background");

				syncState(state);

				setInitializationError(false);
			} catch (error) {
				setInitializationError(true);
				console.error("Failed to load runtime state from background:", error);
			}
		};

		loadData();
	}, [syncState]);

	/**
	 * Listen for state updates from background
	 */
	useEffect(() => {
		const handleMessage = (
			message: UpdateStateMessage,
			_sender: chrome.runtime.MessageSender,
		) => {
			if (message.type === "UPDATE_STATE_MESSAGE") {
				syncState(message.payload);
			}
		};

		chrome.runtime.onMessage.addListener(handleMessage);
		return () => chrome.runtime.onMessage.removeListener(handleMessage);
	}, [syncState]);

	/**
	 * Update state in background
	 */
	const updateSingleTempState = useCallback(
		<T,>(field: keyof BackgroundStateTempData, value: T | ((prev: T) => T)) => {
			let setState: Dispatch<SetStateAction<T>>;
			switch (field) {
				case "clickNumber":
					setState = setClickNumber as Dispatch<SetStateAction<T>>;
					break;
				case "tempLocation":
					setState = setTempLocation as Dispatch<SetStateAction<T>>;
					break;
				case "status":
					setState = setStatus as Dispatch<SetStateAction<T>>;
					break;
				default:
					throw new Error(`Unknown tempData field: ${field}`);
			}

			setState((prev) => {
				const resolvedValue =
					typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

				// Send update to background
				chrome.runtime.sendMessage({
					type: "UPDATE_STATE_MESSAGE",
					payload: {
						tempData: {
							[field]: resolvedValue,
						},
					},
				} satisfies UpdateStateMessage);

				return resolvedValue;
			});
		},
		[],
	);

	/**
	 * Trigger the driver method in background
	 */
	const runDriver = useCallback(() => {
		chrome.runtime.sendMessage({
			type: "RUN_DRIVER_MESSAGE",
		});
	}, []);

	return (
		<RuntimeStateContext.Provider
			value={
				{
					initializationError,
					clickNumber,
					updateSingleTempState,
					lastSynced,
					tempLocation,
					status,
					runDriver,
				} satisfies RuntimeStateContextComponents
			}
		>
			{children}
		</RuntimeStateContext.Provider>
	);
};

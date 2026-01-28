import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

/**
 * Runtime state synchronized with background service worker
 */
interface RuntimeStateContextComponents {
	clickNumber: number;
	incrementClickNumber: () => void;
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
	const [clickNumber, setClickNumber] = useState<number>(0);

	/**
	 * Initialize state from background on mount
	 */
	useEffect(() => {
		chrome.runtime
			.sendMessage({ type: "GET_STATE" })
			.then((state) => {
				if (state?.clickNumber !== undefined) {
					setClickNumber(state.clickNumber);
				}
			})
			.catch(console.error);
	}, []);

	/**
	 * Listen for state updates from background
	 */
	useEffect(() => {
		const handleMessage = (
			message: { type: string; payload?: { clickNumber: number } },
			_sender: chrome.runtime.MessageSender,
		) => {
			if (message.type === "STATE_UPDATE" && message.payload) {
				setClickNumber(message.payload.clickNumber);
			}
		};

		chrome.runtime.onMessage.addListener(handleMessage);
		return () => chrome.runtime.onMessage.removeListener(handleMessage);
	}, []);

	/**
	 * Send increment request to background
	 */
	const incrementClickNumber = useCallback(() => {
		chrome.runtime
			.sendMessage({ type: "INCREMENT_CLICK" })
			.catch(console.error);
	}, []);

	return (
		<RuntimeStateContext.Provider
			value={
				{
					clickNumber,
					incrementClickNumber,
				} satisfies RuntimeStateContextComponents
			}
		>
			{children}
		</RuntimeStateContext.Provider>
	);
};

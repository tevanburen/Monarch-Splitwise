import {
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import type { PageContextMessage } from "./api.types";

// inject page-context-injection
(() => {
	const script = document.createElement("script");
	script.src = chrome.runtime.getURL("dist/page-context-injection.js");
	script.onload = () => script.remove();
	(document.head || document.documentElement).appendChild(script);
})();

/**
 * Context interface providing access to page-level data like auth tokens.
 */
interface PageContextComponents {
	authToken: string | undefined;
}

const pageContext = createContext<PageContextComponents | undefined>(undefined);

/**
 * Hook to access the page context containing authentication and page-level data.
 *
 * @throws Error if used outside of PageContextProvider
 * @returns Page context with auth token
 */
export const usePageContext = (): PageContextComponents => {
	const context = useContext(pageContext);
	if (!context) {
		throw new Error("usePageContext must be used within a PageContextProvider");
	}
	return context;
};

/**
 * Provider component that captures authentication tokens from page context.
 * Listens for messages from the injected page script containing auth data.
 *
 * @component
 */
export const PageContextProvider = ({ children }: PropsWithChildren) => {
	/**
	 * State
	 */
	const [authToken, setAuthToken] = useState<string | undefined>(undefined);

	/**
	 * Effects
	 */
	useEffect(() => {
		const handler = (event: MessageEvent) => {
			if (event.data?.isTvbMessage) {
				const data = event.data as PageContextMessage;
				switch (data.type) {
					case "authToken": {
						setAuthToken(data.payload);
					}
				}
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	});

	return (
		<pageContext.Provider
			value={{
				authToken,
			}}
		>
			{children}
		</pageContext.Provider>
	);
};

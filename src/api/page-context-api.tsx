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

interface PageContextComponents {
	authToken: string | undefined;
}

const pageContext = createContext<PageContextComponents | undefined>(undefined);

export const usePageContext = (): PageContextComponents => {
	const context = useContext(pageContext);
	if (!context) {
		throw new Error("usePageContext must be used within a PageContextProvider");
	}
	return context;
};

export const PageContextProvider = ({ children }: PropsWithChildren) => {
	const [authToken, setAuthToken] = useState<string | undefined>(undefined);

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

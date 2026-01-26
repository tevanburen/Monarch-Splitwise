import type React from "react";
import { createContext, useContext } from "react";

interface ShadowRootContextType {
	shadowRoot: ShadowRoot | null;
}

const ShadowRootContext = createContext<ShadowRootContextType>({
	shadowRoot: null,
});

export const useShadowRoot = () => useContext(ShadowRootContext);

export const ShadowRootProvider = ({
	children,
	shadowRoot,
}: {
	children: React.ReactNode;
	shadowRoot: ShadowRoot;
}) => {
	return (
		<ShadowRootContext.Provider value={{ shadowRoot }}>
			{children}
		</ShadowRootContext.Provider>
	);
};

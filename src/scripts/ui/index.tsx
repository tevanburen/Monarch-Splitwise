import { createRoot } from "react-dom/client";
import "./index.css";
import { StrictMode } from "react";
import { RuntimeStateProvider } from "@/providers";
import { App } from "./App";

const el = document.getElementById("root");
if (!el) {
	throw new Error("Root element not found");
}

const root = createRoot(el);
root.render(
	<StrictMode>
		<RuntimeStateProvider>
			<App />
		</RuntimeStateProvider>
	</StrictMode>,
);

// Observe content size changes and notify parent to resize iframe
const resizeObserver = new ResizeObserver(() => {
	const height = document.body.scrollHeight;
	const width = document.body.scrollWidth;
	window.parent.postMessage({ type: "resize-iframe", height, width }, "*");
});

resizeObserver.observe(document.body);

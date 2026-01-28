import { createRoot } from "react-dom/client";
import "./inner-root.css";
import { StrictMode } from "react";
import { RuntimeStateProvider } from "./providers";
import { ExampleComponent } from "./test";

const el = document.getElementById("root");
if (!el) {
	throw new Error("Root element not found");
}

const root = createRoot(el);
root.render(
	<StrictMode>
		<RuntimeStateProvider>
			<ExampleComponent />
		</RuntimeStateProvider>
	</StrictMode>,
);

// Observe content size changes and notify parent to resize iframe
const resizeObserver = new ResizeObserver(() => {
	const height = document.body.scrollHeight;
	window.parent.postMessage({ type: "resize-iframe", height }, "*");
});

resizeObserver.observe(document.body);

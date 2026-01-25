import { createRoot } from "react-dom/client";
import "../globals.css"; // Import so Vite bundles it
import { WidgetCard } from "./components";

// Create host element
const hostElement = document.createElement("div");
hostElement.id = "monarch-splitwise-widget-host";
document.body.appendChild(hostElement);

// Create shadow DOM for complete CSS isolation
const shadowRoot = hostElement.attachShadow({ mode: "open" });

// Create wrapper
const wrapper = document.createElement("div");
wrapper.className = "shadow-root-wrapper";
shadowRoot.appendChild(wrapper);

// Fetch and inject styles into shadow DOM
fetch(chrome.runtime.getURL("dist/app.css"))
	.then((response) => response.text())
	.then((css) => {
		const styleElement = document.createElement("style");
		styleElement.textContent = css;
		shadowRoot.insertBefore(styleElement, wrapper);

		// Render the widget AFTER styles are loaded
		const root = createRoot(wrapper);
		root.render(
			<WidgetCard>
				<div>tvbtvbtvb</div>
			</WidgetCard>,
		);
	})
	.catch((error) => {
		console.error("Failed to load widget styles:", error);
		// Render anyway so we can debug
		const root = createRoot(wrapper);
		root.render(
			<WidgetCard>
				<div>tvbtvbtvb (no styles)</div>
			</WidgetCard>,
		);
	});

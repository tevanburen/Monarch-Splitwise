import { createRoot } from "react-dom/client";
import "../globals.css";
import { App } from "./App";
import { ShadowRootProvider } from "./providers";

// Create host element with shadow DOM
const host = document.createElement("div");
host.id = "monarch-splitwise-widget-host";
host.style.cssText = "all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 2147483647;";
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: "open" });
const root = document.createElement("div");
root.style.cssText = "position: relative; width: 100%; height: 100%; background: transparent;";
shadow.appendChild(root);

// Load CSS into shadow DOM
const style = document.createElement("style");
fetch(chrome.runtime.getURL("dist/style.css"))
	.then((res) => res.text())
	.then((css) => {
		style.textContent = css;
		shadow.insertBefore(style, root);
	});

// Render widget
createRoot(root).render(
	<ShadowRootProvider shadowRoot={shadow}>
		<App />
	</ShadowRootProvider>,
);

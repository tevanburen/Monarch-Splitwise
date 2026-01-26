import { createRoot } from "react-dom/client";
import "../globals.css";
import { App } from "./App";

// Create host element with shadow DOM
const host = document.createElement("div");
host.id = "monarch-splitwise-widget-host";
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: "open" });
const root = document.createElement("div");
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
createRoot(root).render(<App />);

/**
 * Content script that injects the extension UI iframe into the page.
 * Runs in content script context with Chrome API access.
 */

// Create and inject an iframe to isolate CSS from the host page
(() => {
	const iframe = document.createElement("iframe");
	iframe.src = chrome.runtime.getURL("dist/ui.html");
	iframe.name = "monarch-splitwise-iframe";

	iframe.style.position = "fixed";
	iframe.style.top = "20px";
	iframe.style.right = "20px";
	iframe.style.width = "400px";
	iframe.style.height = "auto";
	iframe.style.border = "none";
	iframe.style.zIndex = "2147483647";
	iframe.style.pointerEvents = "auto";

	// Listen for resize messages from the iframe
	window.addEventListener("message", (event) => {
		if (
			event.data?.type === "resize-iframe" &&
			event.source === iframe.contentWindow
		) {
			iframe.style.height = `${event.data.height}px`;
		}
	});

	document.documentElement.appendChild(iframe);
})();

// Inject page context script for fetch interception
(() => {
	const script = document.createElement("script");
	script.src = chrome.runtime.getURL("dist/fetch-interceptor.js");
	script.onload = () => script.remove();
	(document.head || document.documentElement).appendChild(script);
})();

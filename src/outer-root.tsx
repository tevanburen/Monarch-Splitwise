// Create and inject an iframe to isolate CSS from the host page
(() => {
	const iframe = document.createElement("iframe");
	iframe.src = chrome.runtime.getURL("dist/inner-root.html");
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

// inject page-context-injection
(() => {
	const script = document.createElement("script");
	script.src = chrome.runtime.getURL("dist/page-context-injection.js");
	script.onload = () => script.remove();
	(document.head || document.documentElement).appendChild(script);
})();

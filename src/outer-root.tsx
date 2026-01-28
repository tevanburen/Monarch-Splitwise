// Create and inject an iframe to isolate CSS from the host page
(() => {
	const iframe = document.createElement("iframe");
	iframe.src = chrome.runtime.getURL("dist/inner-root.html");
	iframe.name = "monarch-splitwise-iframe";
	document.body.appendChild(iframe);
})();

// inject page-context-injection
(() => {
	const script = document.createElement("script");
	script.src = chrome.runtime.getURL("dist/page-context-injection.js");
	script.onload = () => script.remove();
	(document.head || document.documentElement).appendChild(script);
})();

// Create and inject an iframe to isolate CSS from the host page
const iframe = document.createElement("iframe");
iframe.style.cssText =
	"position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; border: none; background: transparent; pointer-events: none;";
iframe.src = chrome.runtime.getURL("dist/iframe.html");
document.body.appendChild(iframe);

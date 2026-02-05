/**
 * Content script that injects the extension UI iframe into the page.
 * Runs in content script context with Chrome API access.
 */

import type { BackgroundState, UpdateStateMessage } from "@/types";

// Create and inject an iframe to isolate CSS from the host page
(() => {
	const iframe = document.createElement("iframe");
	iframe.src = chrome.runtime.getURL("dist/ui.html");
	iframe.name = "monarch-splitwise-iframe";

	iframe.style.position = "fixed";
	iframe.style.bottom = "20px";
	iframe.style.right = "20px";
	iframe.style.width = "auto";
	iframe.style.height = "auto";
	iframe.style.border = "none";
	iframe.style.zIndex = "2147483647";
	iframe.style.pointerEvents = "auto";

	// Track fullscreen state and position
	let isFullscreen = false;
	let tempLocation: "left" | "right" = "right";

	// Toggle fullscreen mode
	const setFullscreen = (shouldBeFullscreen: boolean) => {
		if (isFullscreen === shouldBeFullscreen) return;
		isFullscreen = shouldBeFullscreen;

		if (shouldBeFullscreen) {
			// Fullscreen mode
			iframe.style.top = "0";
			iframe.style.left = "0";
			iframe.style.right = "0";
			iframe.style.bottom = "0";
			iframe.style.width = "100vw";
			iframe.style.height = "100vh";
		} else {
			// Normal mode
			updatePosition();
		}
	};

	// Update iframe position based on tempLocation
	const updatePosition = () => {
		iframe.style.top = "";
		iframe.style.bottom = "20px";
		iframe.style.width = "auto";
		iframe.style.height = "auto";

		if (tempLocation === "left") {
			iframe.style.left = "20px";
			iframe.style.right = "";
		} else {
			iframe.style.right = "20px";
			iframe.style.left = "";
		}
	};

	// Initialize state from background service worker
	const initializeState = async () => {
		try {
			const state: BackgroundState = await chrome.runtime.sendMessage({
				type: "GET_STATE_MESSAGE",
			});

			if (state.tempData) {
				if (state.tempData.tempLocation !== undefined) {
					tempLocation = state.tempData.tempLocation;
				}
				if (state.tempData.status !== undefined) {
					setFullscreen(state.tempData.status !== "idle");
				}
			}

			// Apply initial position if not fullscreen
			if (!isFullscreen) {
				updatePosition();
			}
		} catch (error) {
			console.error(
				"Failed to initialize iframe state from background:",
				error,
			);
		}
	};

	// Listen for resize messages from the iframe
	window.addEventListener("message", (event) => {
		if (event.source !== iframe.contentWindow) return;

		if (event.data?.type === "resize-iframe" && !isFullscreen) {
			iframe.style.height = `${event.data.height}px`;
			iframe.style.width = `${event.data.width}px`;
		}
	});

	// Listen for state updates from background service worker
	chrome.runtime.onMessage.addListener((message: UpdateStateMessage) => {
		if (message.type === "UPDATE_STATE_MESSAGE") {
			const status = message.payload?.tempData?.status;
			if (status !== undefined) {
				setFullscreen(status !== "idle");
			}

			const location = message.payload?.tempData?.tempLocation;
			if (location !== undefined) {
				tempLocation = location;
				if (!isFullscreen) {
					updatePosition();
				}
			}
		}
	});

	document.documentElement.appendChild(iframe);

	// Initialize state after iframe is added
	initializeState();
})();

// Inject page context script for fetch interception
(() => {
	const script = document.createElement("script");
	script.src = chrome.runtime.getURL("dist/fetch-interceptor.js");
	script.onload = () => script.remove();
	(document.head || document.documentElement).appendChild(script);
})();

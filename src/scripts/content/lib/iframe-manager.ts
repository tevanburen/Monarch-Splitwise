/**
 * Manages the iframe injection and positioning.
 * Handles fullscreen toggling and dynamic resizing.
 *
 * The iframe is used to isolate the extension UI CSS from the host page.
 * It can be positioned in one of two corners (left/right) or expanded to fullscreen.
 */

/**
 * Interface for iframe management operations.
 */
export interface IframeManager {
	/** Injects the iframe into the page */
	init(): void;
	/** Toggles between fullscreen and windowed mode */
	setFullscreen(shouldBeFullscreen: boolean): void;
	/** Updates iframe position (left or right corner) */
	updatePosition(location: "left" | "right"): void;
}

/**
 * Creates and returns an iframe manager instance.
 * The manager controls a fixed-position iframe that can be resized and repositioned.
 *
 * @returns IframeManager instance with control methods
 */
export const createIframeManager = (): IframeManager => {
	// Create iframe element with initial styling
	const iframe = document.createElement("iframe");
	iframe.src = chrome.runtime.getURL("dist/ui.html");
	iframe.name = "monarch-splitwise-iframe";

	// Set initial fixed positioning and styling
	iframe.style.position = "fixed";
	iframe.style.bottom = "20px";
	iframe.style.right = "20px";
	iframe.style.width = "auto";
	iframe.style.height = "auto";
	iframe.style.border = "none";
	iframe.style.zIndex = "2147483647"; // Very high z-index to appear above page content
	iframe.style.pointerEvents = "auto";

	// Track fullscreen and position state
	let isFullscreen = false;
	let tempLocation: "left" | "right" = "right";

	/**
	 * Toggles between fullscreen and windowed modes.
	 * In fullscreen mode, the iframe covers the entire viewport.
	 * Otherwise, it's positioned in a corner based on tempLocation.
	 */
	const setFullscreen = (shouldBeFullscreen: boolean) => {
		if (isFullscreen === shouldBeFullscreen) return;
		isFullscreen = shouldBeFullscreen;

		if (shouldBeFullscreen) {
			// Fullscreen mode - cover entire viewport
			iframe.style.top = "0";
			iframe.style.left = "0";
			iframe.style.right = "0";
			iframe.style.bottom = "0";
			iframe.style.width = "100vw";
			iframe.style.height = "100vh";
		} else {
			// Normal windowed mode - reposition to corner
			updatePosition(tempLocation);
		}
	};

	/**
	 * Updates the iframe position to the specified corner.
	 * Only applies when not in fullscreen mode.
	 */
	const updatePosition = (location: "left" | "right") => {
		tempLocation = location;

		// Reset to windowed dimensions
		iframe.style.top = "";
		iframe.style.bottom = "20px";
		iframe.style.width = "auto";
		iframe.style.height = "auto";

		// Position in specified corner
		if (location === "left") {
			iframe.style.left = "20px";
			iframe.style.right = "";
		} else {
			iframe.style.right = "20px";
			iframe.style.left = "";
		}
	};

	/**
	 * Sets up the message listener for iframe resize events.
	 * When the iframe sends a resize-iframe message, this applies the new dimensions.
	 * Resize only applies in windowed mode; fullscreen iframe is not resizable.
	 */
	const setupResizeListener = () => {
		window.addEventListener("message", (event) => {
			// Only accept messages from the iframe
			if (event.source !== iframe.contentWindow) return;

			// Handle resize events from iframe - directly apply to iframe styles
			if (event.data?.type === "resize-iframe" && !isFullscreen) {
				iframe.style.height = `${event.data.height}px`;
				iframe.style.width = `${event.data.width}px`;
			}
		});
	};

	/**
	 * Injects the iframe into the DOM and sets up all listeners.
	 * Should be called once during initialization.
	 */
	const init = () => {
		setupResizeListener();
		document.documentElement.appendChild(iframe);
	};

	return {
		init,
		setFullscreen,
		updatePosition,
	};
};

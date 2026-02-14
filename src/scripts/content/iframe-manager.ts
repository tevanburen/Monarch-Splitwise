/**
 * Manages the iframe injection and positioning.
 * Handles fullscreen toggling and dynamic resizing.
 *
 * The iframe is used to isolate the extension UI CSS from the host page.
 * It can be positioned in one of two corners (left/right) or expanded to fullscreen.
 */

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
export const setFullscreen = (shouldBeFullscreen: boolean): void => {
	if (isFullscreen === shouldBeFullscreen) return;
	isFullscreen = shouldBeFullscreen;

	if (shouldBeFullscreen) {
		// Fullscreen mode - cover entire viewport
		iframe.style.top = "0";
		iframe.style.left = "0";
		iframe.style.right = "0";
		iframe.style.bottom = "0";
		iframe.style.width = "100%";
		iframe.style.height = "100%";
	} else {
		// Normal windowed mode - reposition to corner
		updatePosition(tempLocation);
	}
};

/**
 * Updates the iframe position to the specified corner.
 * Only applies when not in fullscreen mode.
 */
export const updatePosition = (newLocation: "left" | "right"): void => {
	tempLocation = newLocation;

	if (isFullscreen) return;

	// Reset to windowed dimensions
	iframe.style.top = "";
	iframe.style.bottom = "20px";
	iframe.style.width = "auto";
	iframe.style.height = "auto";

	// Position in specified corner
	if (newLocation === "left") {
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
window.addEventListener("message", (event) => {
	// Only accept messages from the iframe
	if (event.source !== iframe.contentWindow) return;

	// Handle resize events from iframe - directly apply to iframe styles
	if (event.data?.type === "resize-iframe" && !isFullscreen) {
		iframe.style.height = `${event.data.height}px`;
		iframe.style.width = `${event.data.width}px`;
	}
});

// Inject iframe into the DOM (auto-initializes on import)
document.documentElement.appendChild(iframe);

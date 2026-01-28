/**
 * Background service worker that maintains global state for the extension.
 * Handles state synchronization across all extension contexts (iframes, popups, etc).
 */

interface BackgroundState {
	clickNumber: number;
}

// Initialize state
const state: BackgroundState = {
	clickNumber: 0,
};

// Message types
type BackgroundMessage =
	| { type: "GET_STATE" }
	| { type: "INCREMENT_CLICK" }
	| { type: "STATE_UPDATE"; payload: BackgroundState };

// Handle incoming messages
chrome.runtime.onMessage.addListener(
	(message: BackgroundMessage, _sender, sendResponse) => {
		switch (message.type) {
			case "GET_STATE":
				sendResponse(state);
				break;

			case "INCREMENT_CLICK":
				state.clickNumber++;
				// Broadcast state update to all extension contexts
				broadcastStateUpdate();
				sendResponse(state);
				break;

			default:
				sendResponse({ error: "Unknown message type" });
		}
		return true; // Keep channel open for async response
	},
);

/**
 * Broadcast state updates to all extension contexts
 */
function broadcastStateUpdate() {
	const message: BackgroundMessage = {
		type: "STATE_UPDATE",
		payload: { ...state },
	};

	// Send to all tabs (content scripts/iframes)
	chrome.tabs.query({}, (tabs) => {
		for (const tab of tabs) {
			if (tab.id) {
				chrome.tabs.sendMessage(tab.id, message).catch(() => {
					// Ignore errors for tabs that don't have listeners
				});
			}
		}
	});

	// Note: Extension pages (like iframes) will receive via runtime.onMessage
	chrome.runtime.sendMessage(message).catch(() => {
		// Ignore if no listeners
	});
}

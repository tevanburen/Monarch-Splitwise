import type {
	BackgroundState,
	GetStateMessage,
	RunDriverMessage,
	UpdateStateMessage,
	UpdateStateMessagePayload,
} from "@/types";

/**
 * Background service worker that maintains global state for the extension.
 * Handles state synchronization across all extension contexts (iframes, popups, etc).
 */

// Initialize state
const state: BackgroundState = {
	syncData: {
		lastSynced: undefined,
		location: "right",
	},
	tempData: {
		clickNumber: 0,
		tempLocation: "left",
		status: "idle",
	},
};

// Handle incoming messages
chrome.runtime.onMessage.addListener(
	(
		message: GetStateMessage | UpdateStateMessage | RunDriverMessage,
		_sender,
		sendResponse,
	) => {
		switch (message.type) {
			case "GET_STATE_MESSAGE":
				sendResponse(state);
				break;

			case "UPDATE_STATE_MESSAGE":
				// Update temp data
				state.tempData = { ...state.tempData, ...message.payload.tempData };

				// For now, treat sync data similarly
				state.syncData = { ...state.syncData, ...message.payload.syncData };

				// Broadcast state update to all extension contexts
				broadcastStateUpdate(message.payload);
				break;

			case "RUN_DRIVER_MESSAGE":
				// The main driver method

				// Set state to running
				state.tempData = { ...state.tempData, status: "running" };
				broadcastStateUpdate({ tempData: { status: "running" } });

				// Simulate data loading (replace with real logic)
				setTimeout(() => {
					// Update state to completed
					state.tempData = { ...state.tempData, status: "idle" };
					broadcastStateUpdate({ tempData: { status: "idle" } });
				}, 5000);
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
const broadcastStateUpdate = (payload: UpdateStateMessagePayload) => {
	const message: UpdateStateMessage = {
		type: "UPDATE_STATE_MESSAGE",
		payload,
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
};

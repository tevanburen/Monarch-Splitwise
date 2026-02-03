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

/**
 * Check if a tab is on Splitwise
 */
const getTabType = (tab: chrome.tabs.Tab): "splitwise" | "monarch" | null => {
	if (!tab.url) {
		return null;
	} else if (tab.url.includes("secure.splitwise.com")) {
		return "splitwise";
	} else if (tab.url.includes("app.monarch.com")) {
		return "monarch";
	}
	return null;
};

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

// Driver data
const driverData = {
	primarySplitwiseTabId: null as number | null,
	primaryMonarchTabId: null as number | null,
}

// Handle incoming messages
chrome.runtime.onMessage.addListener(
	(
		message: GetStateMessage | UpdateStateMessage | RunDriverMessage,
		sender,
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

				// Set tab as primary based on type
				if (sender.tab) {
					const tabType = getTabType(sender.tab);
					if (tabType === "splitwise") {
						driverData.primarySplitwiseTabId = sender.tab.id || null;
					} else if (tabType === "monarch") {
						driverData.primaryMonarchTabId = sender.tab.id || null;
					}
				}

				driver().finally(() => {
					// Set state to idle
					state.tempData = { ...state.tempData, status: "idle" };
					broadcastStateUpdate({ tempData: { status: "idle" } });
				});

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

const driver = async () => {
	try {
		const response = fetchRowsFromSplitwise();
	} catch {
		// skip
	}
}

const fetchRowsFromSplitwise: unknown = async () => {
	if (driverData.primarySplitwiseTabId === null) {
		throw new Error("No primary Splitwise tab set");
	}
	
	const response = await chrome.scripting.executeScript();
}
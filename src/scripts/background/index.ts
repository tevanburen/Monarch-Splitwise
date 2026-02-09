import type {
	BackgroundState,
	GetStateMessage,
	RunDriverMessage,
	UpdateStateMessage,
} from "@/types";
import { broadcastStateUpdate, getTabType } from "./background.utils";
import { fetchRowsFromSplitwise } from "./steps";

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

// Driver data
const driverData = {
	primarySplitwiseTabId: null as number | null,
	primaryMonarchTabId: null as number | null,
};

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

			// TODO: Deprecate this in favor of RunDriver and specific update messages for the edit modal
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

const driver = async () => {
	// Request auth tokens from all tabs
	chrome.tabs.query({}, (tabs) => {
		for (const tab of tabs) {
			if (tab.id) {
				chrome.tabs
					.sendMessage(tab.id, {
						type: "PRINT_AUTH_TOKEN_MESSAGE",
					})
					.catch(() => {
						// Ignore errors for tabs that don't have listeners
					});
			}
		}
	});

	const rowsFromSplitwise = await fetchRowsFromSplitwise(
		driverData.primarySplitwiseTabId,
	);
	console.log("Rows from Splitwise:", rowsFromSplitwise);
};

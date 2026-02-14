/**
 * Utility functions for the background service worker.
 * Contains helpers for tab communication and state broadcasting.
 */

import type {
	UpdateStateBroadcastMessage,
	UpdateStateMessagePayload,
} from "@/types";

/**
 * Determines what type of page a tab is on based on its URL.
 *
 * @param tab The Chrome tab to check
 * @returns "splitwise", "monarch", or null if the tab is not on either site
 */
export const getTabType = (
	tab: chrome.tabs.Tab,
): "splitwise" | "monarch" | null => {
	if (!tab.url) {
		return null;
	} else if (tab.url.includes("secure.splitwise.com")) {
		return "splitwise";
	} else if (tab.url.includes("app.monarch.com")) {
		return "monarch";
	}
	return null;
};

/**
 * Broadcasts a state update to all extension contexts (tabs, iframes, popups, etc).
 *
 * @param payload The state update payload containing tempData and/or syncData changes
 */
export const broadcastStateUpdate = (payload: UpdateStateMessagePayload) => {
	const message: UpdateStateBroadcastMessage = {
		type: "UPDATE_STATE_BROADCAST_MESSAGE",
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

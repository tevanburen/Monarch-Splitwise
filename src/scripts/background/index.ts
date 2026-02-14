import type {
	ExitSettingsMessage,
	GetStateMessage,
	RunDriverMessage,
	UpdateStateRequestMessage,
} from "@/types";
import { getTabType } from "./background.utils";
import { driver } from "./driver";
import {
	exitSettings,
	getState,
	updateDriverData,
	updateState,
} from "./state-manager";

/**
 * Background service worker that maintains global state for the extension.
 * Handles state synchronization across all extension contexts (iframes, popups, etc).
 */

// Handle incoming messages
chrome.runtime.onMessage.addListener(
	(
		message:
			| GetStateMessage
			| UpdateStateRequestMessage
			| RunDriverMessage
			| ExitSettingsMessage,
		sender,
		sendResponse,
	) => {
		switch (message.type) {
			case "GET_STATE_MESSAGE":
				sendResponse(getState());
				break;

			// TODO: Deprecate this in favor of RunDriver and specific update messages for the edit modal
			case "UPDATE_STATE_REQUEST_MESSAGE":
				// Update state (automatically broadcasts to all contexts)
				updateState(message.payload);
				break;

			case "EXIT_SETTINGS_MESSAGE":
				exitSettings(message.payload);
				break;

			case "RUN_DRIVER_MESSAGE":
				// The main driver method

				// Set state to running (automatically broadcasts)
				updateState({ tempData: { status: "running" } });

				// Set tab as primary based on type
				if (sender.tab) {
					const tabType = getTabType(sender.tab);
					if (tabType === "splitwise") {
						updateDriverData({
							primarySplitwiseTabId: sender.tab.id || null,
						});
					} else if (tabType === "monarch") {
						updateDriverData({
							primaryMonarchTabId: sender.tab.id || null,
						});
					}
				}

				driver().finally(() => {
					// Set state to idle (automatically broadcasts)
					updateState({ tempData: { status: "idle" } });
				});

				break;

			default:
				sendResponse({ error: "Unknown message type" });
		}
		return true; // Keep channel open for async response
	},
);

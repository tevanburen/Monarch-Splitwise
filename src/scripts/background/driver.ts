import type {
	SplitwiseRowRequestMessage,
	SplitwiseRowResponseMessage,
} from "@/types";
import { sendMessageWithKeepAlive } from "./background.utils";
import type { StateManager } from "./state-manager";

export const driver = async (stateManager: StateManager) => {
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

	const rowsFromSplitwise = await fetchRowsFromSplitwise(stateManager);
	console.log("Rows from Splitwise:", rowsFromSplitwise);
};

const fetchRowsFromSplitwise = async (
	stateManager: StateManager,
): Promise<string[]> => {
	const primarySplitwiseTabId =
		stateManager.getDriverData().primarySplitwiseTabId;
	if (primarySplitwiseTabId === null) {
		throw new Error("No primary Splitwise tab set");
	}

	// Send request to content script on the Splitwise tab with keep-alive monitoring
	const response = await sendMessageWithKeepAlive<SplitwiseRowResponseMessage>(
		primarySplitwiseTabId,
		{
			type: "SPLITWISE_ROW_REQUEST_MESSAGE",
		} satisfies SplitwiseRowRequestMessage,
	);

	// Extract rows from response payload
	return response.payload;
};

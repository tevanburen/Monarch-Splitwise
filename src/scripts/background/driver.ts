import type {
	MonarchRowRequestMessage,
	MonarchRowResponseMessage,
	SplitwiseRowRequestMessage,
	SplitwiseRowResponseMessage,
} from "@/types";
import { sendMessageWithKeepAlive } from "./background.utils";
import { getDriverData, getState } from "./state-manager";

export const driver = async () => {
	const rowsFromSplitwise = await fetchRowsFromSplitwise();
	console.log("Rows from Splitwise:", rowsFromSplitwise);
	const rowsFromMonarch = await fetchRowsFromMonarch();
	console.log("Rows from Monarch:", rowsFromMonarch);
};

const fetchRowsFromSplitwise = async (): Promise<Record<string, unknown[]>> => {
	const primarySplitwiseTabId = getDriverData().primarySplitwiseTabId;
	if (primarySplitwiseTabId === null) {
		throw new Error("No primary Splitwise tab set");
	}

	// Send request to content script on the Splitwise tab with keep-alive monitoring
	const response = await sendMessageWithKeepAlive<SplitwiseRowResponseMessage>(
		primarySplitwiseTabId,
		{
			type: "SPLITWISE_ROW_REQUEST_MESSAGE",
			payload: getState()
				.syncData.accounts.filter((account) => !account.inactive)
				.map((account) => account.splitwiseId),
		} satisfies SplitwiseRowRequestMessage,
	);

	// Extract rows from response payload
	return response.payload;
};

const fetchRowsFromMonarch = async (): Promise<Record<string, unknown[]>> => {
	const primaryMonarchTabId = getDriverData().primaryMonarchTabId;
	if (primaryMonarchTabId === null) {
		throw new Error("No primary Monarch tab set");
	}

	// Send request to content script on the Monarch tab with keep-alive monitoring
	const response = await sendMessageWithKeepAlive<MonarchRowResponseMessage>(
		primaryMonarchTabId,
		{
			type: "MONARCH_ROW_REQUEST_MESSAGE",
			payload: getState()
				.syncData.accounts.filter((account) => !account.inactive)
				.map((account) => account.monarchId),
		} satisfies MonarchRowRequestMessage,
	);

	// Extract rows from response payload
	return response.payload;
};

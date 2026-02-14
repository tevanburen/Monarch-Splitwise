import type {
	BackgroundDriverData,
	MonarchRowRequestMessage,
	MonarchRowResponseMessage,
	SplitwiseRowRequestMessage,
	SplitwiseRowResponseMessage,
} from "@/types";
import { sendMessageWithKeepAlive, withLock } from "./background.utils";
import { getState, updateState } from "./state-manager";

// Driver data
const driverData: BackgroundDriverData = {
	primarySplitwiseTabId: null,
	primaryMonarchTabId: null,
};

/**
 * Update driver data with partial changes.
 */
export const updateDriverData = (
	partialNewData: Partial<BackgroundDriverData>,
): void => {
	if (partialNewData.primarySplitwiseTabId !== undefined) {
		driverData.primarySplitwiseTabId = partialNewData.primarySplitwiseTabId;
	}
	if (partialNewData.primaryMonarchTabId !== undefined) {
		driverData.primaryMonarchTabId = partialNewData.primaryMonarchTabId;
	}
};

export const driver = withLock(async () => {
	updateState({ tempData: { status: "running" } });
	try {
		const rowsFromSplitwise = await fetchRowsFromSplitwise();
		console.log("Rows from Splitwise:", rowsFromSplitwise);
		const rowsFromMonarch = await fetchRowsFromMonarch();
		console.log("Rows from Monarch:", rowsFromMonarch);
	} finally {
		updateState({ tempData: { status: "idle" } });
	}
});

const fetchRowsFromSplitwise = async (): Promise<Record<string, unknown[]>> => {
	const primarySplitwiseTabId = driverData.primarySplitwiseTabId;
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
	const primaryMonarchTabId = driverData.primaryMonarchTabId;
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

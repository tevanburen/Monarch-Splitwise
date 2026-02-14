import type {
	AccountFetchResult,
	BackgroundDriverData,
	MonarchRowRequestMessage,
	MonarchRowResponseMessage,
	SplitwiseRowRequestMessage,
	SplitwiseRowResponseMessage,
} from "@/types";
import {
	createOrGetTab,
	sendMessageWithKeepAlive,
	withLock,
} from "./background.utils";
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

/**
 * Ensures a Splitwise tab exists and is ready for communication.
 * If no tab exists or the existing tab is invalid, creates a new one.
 * Note: The tab ID is automatically set by the message handler when the tab sends GET_STATE_MESSAGE.
 */
const ensureSplitwiseTab = async (): Promise<number> => {
	return await createOrGetTab(
		driverData.primarySplitwiseTabId,
		"https://secure.splitwise.com",
	);
};

/**
 * Ensures a Monarch tab exists and is ready for communication.
 * If no tab exists or the existing tab is invalid, creates a new one.
 * Note: The tab ID is automatically set by the message handler when the tab sends GET_STATE_MESSAGE.
 */
const ensureMonarchTab = async (): Promise<number> => {
	return await createOrGetTab(
		driverData.primaryMonarchTabId,
		"https://app.monarch.com",
	);
};

const fetchRowsFromSplitwise = async (): Promise<
	Record<string, AccountFetchResult>
> => {
	// Ensure a Splitwise tab exists and is ready
	const primarySplitwiseTabId = await ensureSplitwiseTab();

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

const fetchRowsFromMonarch = async (): Promise<
	Record<string, AccountFetchResult>
> => {
	// Ensure a Monarch tab exists and is ready
	const primaryMonarchTabId = await ensureMonarchTab();

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

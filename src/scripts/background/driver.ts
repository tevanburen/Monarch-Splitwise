import type {
	AccountFetchResult,
	BackgroundDriverData,
	MonarchRowRequestMessage,
	MonarchRowResponseMessage,
	MonarchRowUploadRequestMessage,
	MonarchRowUploadResponseMessage,
	SplitwiseRowRequestMessage,
	SplitwiseRowResponseMessage,
	TvbAccount,
	TvbRow,
} from "@/types";
import {
	createOrGetTab,
	sendMessageWithKeepAlive,
	withLock,
} from "./background.utils";
import { removeSimilarRows, spliceElementsBS } from "./rows";
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
		const activeAccountMap = getState()
			.syncData.accounts.filter((account) => !account.inactive)
			.reduce(
				(acc, account) => {
					acc[account.monarchId] = {
						...account,
						error: false,
						oldRows: [],
						newRows: [],
					};
					return acc;
				},
				{} as Record<
					string,
					TvbAccount & {
						error: boolean;
						oldRows: TvbRow[];
						newRows: TvbRow[];
					}
				>,
			);

		// Fetch rows from both Splitwise and Monarch in parallel
		await Promise.all([
			(async () => {
				const splitwiseResult = await fetchRowsFromSplitwise(
					Object.values(activeAccountMap).map((a) => a.splitwiseId),
				);
				Object.values(activeAccountMap).forEach((account) => {
					if (splitwiseResult[account.splitwiseId]) {
						account.error ||= Boolean(
							splitwiseResult[account.splitwiseId].error,
						);
						account.newRows = splitwiseResult[account.splitwiseId].rows;
					} else {
						account.error = true;
					}
				});
			})(),
			(async () => {
				const monarchResult = await fetchRowsFromMonarch(
					Object.values(activeAccountMap).map((a) => a.monarchId),
				);
				Object.values(activeAccountMap).forEach((account) => {
					if (monarchResult[account.monarchId]) {
						account.error ||= Boolean(monarchResult[account.monarchId].error);
						account.oldRows = monarchResult[account.monarchId].rows;
					} else {
						account.error = true;
					}
				});
			})(),
		]);

		Object.values(activeAccountMap).forEach((account) => {
			if (account.error) return;
			// Process accounts without errors

			// trim rows to startDate
			if (account.startDate) {
				spliceElementsBS<TvbRow, Date>(
					account.newRows,
					(row) => row.date,
					new Date(account.startDate),
					(a, b) => a.getTime() - b.getTime(),
				);
				spliceElementsBS<TvbRow, Date>(
					account.oldRows,
					(row) => row.date,
					new Date(account.startDate),
					(a, b) => a.getTime() - b.getTime(),
				);
			}

			// Remove similar rows between Splitwise and Monarch
			removeSimilarRows(account.newRows, account.oldRows);

			// warn of floating old charges
			if (account.oldRows.length) {
				console.warn("The following rows are unmatched:", account.oldRows);
			}
		});

		// Log the active account map for debugging
		console.log(activeAccountMap);

		// Upload new rows to Monarch
		await uploadRowsToMonarch(
			Object.values(activeAccountMap)
				.filter((account) => !account.error)
				.reduce(
					(acc, account) => {
						acc[account.monarchId] = account.newRows;
						return acc;
					},
					{} as Record<string, TvbRow[]>,
				),
		);
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

const fetchRowsFromSplitwise = async (
	accountIds: string[],
): Promise<Record<string, AccountFetchResult>> => {
	// Ensure a Splitwise tab exists and is ready
	const primarySplitwiseTabId = await ensureSplitwiseTab();

	// Send request to content script on the Splitwise tab with keep-alive monitoring
	const response = await sendMessageWithKeepAlive<SplitwiseRowResponseMessage>(
		primarySplitwiseTabId,
		{
			type: "SPLITWISE_ROW_REQUEST_MESSAGE",
			payload: accountIds,
		} satisfies SplitwiseRowRequestMessage,
	);

	// Process the response payload to convert dates to Date objects
	Object.values(response.payload).forEach((result) => {
		result.rows.forEach((row) => {
			row.date = new Date(row.date);
		});
	});

	// Extract rows from response payload
	return response.payload;
};

const fetchRowsFromMonarch = async (
	accountIds: string[],
): Promise<Record<string, AccountFetchResult>> => {
	// Ensure a Monarch tab exists and is ready
	const primaryMonarchTabId = await ensureMonarchTab();

	// Send request to content script on the Monarch tab with keep-alive monitoring
	const response = await sendMessageWithKeepAlive<MonarchRowResponseMessage>(
		primaryMonarchTabId,
		{
			type: "MONARCH_ROW_REQUEST_MESSAGE",
			payload: accountIds,
		} satisfies MonarchRowRequestMessage,
	);

	// Process the response payload to convert dates to Date objects
	Object.values(response.payload).forEach((result) => {
		result.rows.forEach((row) => {
			row.date = new Date(row.date);
		});
	});

	// Extract rows from response payload
	return response.payload;
};

const uploadRowsToMonarch = async (accountMap: Record<string, TvbRow[]>) => {
	// Ensure a Monarch tab exists and is ready
	const primaryMonarchTabId = await ensureMonarchTab();

	// Send rows to Monarch for upload
	const response =
		await sendMessageWithKeepAlive<MonarchRowUploadResponseMessage>(
			primaryMonarchTabId,
			{
				type: "MONARCH_ROW_UPLOAD_REQUEST_MESSAGE",
				payload: accountMap,
			} satisfies MonarchRowUploadRequestMessage,
		);

	// Process the response payload to confirm upload
	Object.entries(response.payload).forEach(([accountId, result]) => {
		if (result.error) {
			console.error(
				`Error uploading rows for account ${accountId}`,
				result.error,
			);
		} else {
			console.log(`Successfully uploaded rows for account ${accountId}`);
		}
	});
};

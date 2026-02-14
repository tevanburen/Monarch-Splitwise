/**
 * API client for making authenticated requests to external services.
 * Captures and uses auth tokens intercepted from the page context.
 *
 * This module has two responsibilities:
 * 1. Capture auth tokens from page context fetch interceptor
 * 2. Use the token to make API calls to external services
 *
 * Token Flow:
 * 1. Page context fetch wrapper intercepts Monarch API requests
 * 2. Extracts Authorization header and dispatches custom DOM event
 * 3. This module listens for the event and stores the token
 * 4. Token is used in API calls to Monarch (not Splitwise - that uses cookies)
 *
 * The background worker can request API calls through chrome.runtime.sendMessage,
 * and this client will execute them using the content script's network access.
 *
 */

import { fetchMonarchCsv, fetchSplitwiseCsv } from "@/methods/api";
import { csvTextToRows } from "@/shared/transformers/common";
import { monarchRowsToTvbRows } from "@/shared/transformers/monarch";
import { splitwiseRowsToTvbRows } from "@/shared/transformers/splitwise";
import type {
	MonarchRow,
	PageContextMessage,
	SplitwiseRow,
	TvbRow,
} from "@/types";

/** Stores the most recently captured auth token from Monarch API requests */
let monarchAuthToken: string | null = null;

/** Stores the Splitwise user name captured from get_main_data response */
let splitwiseUserName: string | null = null;

/**
 * Interface for API client operations.
 */
export interface ApiClient {
	fetchSplitwiseRows(accountIds: string[]): Promise<Record<string, TvbRow[]>>;
	fetchMonarchRows(accountIds: string[]): Promise<Record<string, TvbRow[]>>;
}

/**
 * Initializes the listener for auth token events from page context.
 * Should be called once during content script initialization.
 *
 * Listens for 'monarch-auth-token' custom DOM events that contain
 * the Authorization header from Monarch API requests.
 */
export const initAuthTokenListener = () => {
	// Listen for auth tokens from page context fetch interceptor
	document.addEventListener("monarch-auth-token", ((event: Event) => {
		const customEvent = event as CustomEvent<PageContextMessage>;
		const message = customEvent.detail;

		// Validate message structure before storing
		if (
			message?.isTvbMessage &&
			message?.source === "page-context" &&
			message?.type === "monarchAuthToken"
		) {
			monarchAuthToken = message.payload;
		}
	}) as EventListener);

	// Listen for Splitwise user data from page context fetch interceptor
	document.addEventListener("splitwise-main-data", ((event: Event) => {
		const customEvent = event as CustomEvent<PageContextMessage>;
		const message = customEvent.detail;

		// Validate message structure before storing
		if (
			message?.isTvbMessage &&
			message?.source === "page-context" &&
			message?.type === "splitwiseUserName"
		) {
			splitwiseUserName = message.payload;
		}
	}) as EventListener);
};

/**
 * Processes Splitwise CSV text, filtering for transactions involving the specified member.
 *
 * @param csvText - The Splitwise CSV text to process
 * @param memberName - The name of the member to filter transactions for
 * @returns Array of transaction rows involving the specified member
 */
const ingestSplitwiseCsvText = (
	csvText: string,
	memberName: string,
): TvbRow[] => {
	// Parse CSV text to splitwise rows
	const splitwiseArr = csvTextToRows<SplitwiseRow>(csvText);

	// Remove the "total balance" row (last row)
	splitwiseArr.pop();

	// Clean the strings otherwise Monarch throws a fit
	splitwiseArr.forEach((row) => {
		row.Description = (row.Description as number | string)
			.toString()
			.replace(/[^a-zA-Z0-9 ]+/g, "");
	});

	// Transform splitwise to tvb
	const tvbArr = splitwiseRowsToTvbRows(splitwiseArr, memberName);

	// Filter out charges that don't involve me
	return tvbArr.filter((row) => row.delta);
};

/**
 * Parses Monarch CSV text data into transaction rows.
 *
 * @param text - The CSV text content from Monarch
 * @returns Array of transaction rows
 */
const ingestMonarchCsvText = (text: string): TvbRow[] => {
	// read splitwise rows
	const splitwiseArr = csvTextToRows<MonarchRow>(text);

	// transform splitwise to tvb
	const tvbArr = monarchRowsToTvbRows(splitwiseArr);

	return tvbArr;
};

/**
 * Creates and returns an API client instance.
 *
 * @returns ApiClient instance for making API requests
 */
export const createApiClient = (): ApiClient => {
	const fetchSplitwiseRows = async (
		accountIds: string[],
	): Promise<Record<string, TvbRow[]>> => {
		const results: Record<string, TvbRow[]> = {};

		if (!splitwiseUserName) {
			console.error(
				"Splitwise user name not available. Please visit Splitwise first to capture your user name.",
			);
			return results;
		}

		// Fetch data for each account ID in parallel
		await Promise.all(
			accountIds.map(async (accountId) => {
				try {
					const csvText = await fetchSplitwiseCsv(accountId);

					// Process and filter the CSV data
					results[accountId] = ingestSplitwiseCsvText(
						csvText,
						splitwiseUserName as string,
					);
				} catch (error) {
					console.error(`Error fetching data for account ${accountId}:`, error);
					results[accountId] = [];
				}
			}),
		);

		return results;
	};

	const fetchMonarchRows = async (
		accountIds: string[],
	): Promise<Record<string, TvbRow[]>> => {
		const results: Record<string, TvbRow[]> = {};

		// Simulate fetching Monarch rows (replace with actual implementation)
		await Promise.all(
			accountIds.map(async (accountId) => {
				try {
					if (!monarchAuthToken) {
						console.error(
							"Monarch auth token not available. Please log in to Monarch first.",
						);
						results[accountId] = [];
						return;
					}

					const csvText = await fetchMonarchCsv(accountId, monarchAuthToken);
					// Process and filter the CSV data
					results[accountId] = ingestMonarchCsvText(csvText);
				} catch (error) {
					console.error(
						`Error fetching Monarch rows for account ${accountId}:`,
						error,
					);
					results[accountId] = [];
				}
			}),
		);

		return results;
	};

	return {
		fetchSplitwiseRows,
		fetchMonarchRows,
	};
};

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

import { csvTextToRows, splitwiseRowsToTvbRows } from "@/methods";
import type { SplitwiseRow, TvbRow } from "@/types";

/** Stores the most recently captured auth token from Monarch API requests */
let authToken: string | null = null;

/**
 * Interface for API client operations.
 */
export interface ApiClient {
	fetchSplitwiseRows(accountIds: string[]): Promise<Record<string, TvbRow[]>>;
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
		const customEvent = event as CustomEvent;
		const message = customEvent.detail;

		// Validate message structure before storing
		if (
			message?.isTvbMessage &&
			message?.source === "page-context" &&
			message?.type === "authToken"
		) {
			authToken = message.payload;
		}
	}) as EventListener);
};

/**
 * Logs the current auth token to the console.
 */
export const printAuthToken = () => {
	console.log("Current auth token:", authToken);
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
 * Creates and returns an API client instance.
 *
 * @returns ApiClient instance for making API requests
 */
export const createApiClient = (): ApiClient => {
	const fetchSplitwiseRows = async (
		accountIds: string[],
	): Promise<Record<string, TvbRow[]>> => {
		const results: Record<string, TvbRow[]> = {};

		const memberName = "TODO: fetch from page";

		// Fetch data for each account ID in parallel
		await Promise.all(
			accountIds.map(async (accountId) => {
				try {
					const url = `https://secure.splitwise.com/api/v3.0/export_group/${accountId}.csv`;

					// Splitwise uses cookie-based authentication, not the Monarch auth token
					const response = await fetch(url, {
						method: "GET",
						credentials: "include", // Include cookies for Splitwise authentication
					});

					if (!response.ok) {
						console.error(
							`Failed to fetch data for account ${accountId}: ${response.status} ${response.statusText}`,
						);
						results[accountId] = [];
						return;
					}

					const csvText = await response.text();
					console.log(`CSV data for account ${accountId}:`, csvText);

					// Process and filter the CSV data
					results[accountId] = ingestSplitwiseCsvText(csvText, memberName);
				} catch (error) {
					console.error(`Error fetching data for account ${accountId}:`, error);
					results[accountId] = [];
				}
			}),
		);

		return results;
	};

	return {
		fetchSplitwiseRows,
	};
};

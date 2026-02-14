/**
 * API fetching utilities for external services.
 *
 * Makes authenticated HTTP requests to Monarch and Splitwise APIs
 * to fetch transaction data in CSV format.
 */

import * as auth from "../auth";

/**
 * Fetches transaction CSV data from Monarch Money API.
 *
 * @param monarchId - The Monarch account ID to fetch transactions for
 * @returns Promise resolving to CSV text content
 * @throws Error if auth token is not available or request fails
 */
export const fetchMonarchCsv = async (monarchId: string): Promise<string> => {
	const authToken = auth.getMonarchToken();

	if (!authToken) {
		throw new Error(
			"Monarch auth token not available. Please log in to Monarch first.",
		);
	}

	const response = await fetch(
		"https://api.monarch.com/download-transactions/",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: authToken,
			},
			body: JSON.stringify({ accounts: [monarchId] }),
			referrerPolicy: "no-referrer",
		},
	);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch Monarch data: ${response.status} ${response.statusText}`,
		);
	}

	return await response.text();
};

/**
 * Fetches transaction CSV data from Splitwise API.
 * Uses cookie-based authentication (automatically included by browser).
 *
 * @param accountId - The Splitwise group ID to fetch transactions for
 * @returns Promise resolving to CSV text content
 * @throws Error if request fails
 */
export const fetchSplitwiseCsv = async (accountId: string): Promise<string> => {
	const response = await fetch(
		`https://secure.splitwise.com/api/v3.0/export_group/${accountId}.csv`,
		{
			method: "GET",
			credentials: "include", // Include cookies for Splitwise authentication
		},
	);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch Splitwise data for account ${accountId}: ${response.status} ${response.statusText}`,
		);
	}

	return await response.text();
};

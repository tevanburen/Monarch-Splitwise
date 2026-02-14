/**
 * Data service orchestrator.
 *
 * Provides high-level API for fetching and transforming transaction data.
 * Coordinates between fetcher and transformer modules to deliver
 * processed transaction data in the internal TvbRow format.
 */

import type { AccountFetchResult } from "@/types";
import { getSplitwiseUserName } from "../auth";
import { fetchMonarchCsv, fetchSplitwiseCsv } from "./fetcher";
import { ingestMonarchCsvText, ingestSplitwiseCsvText } from "./transformers";

/**
 * Fetches and transforms Splitwise transaction data for multiple accounts.
 *
 * @param accountIds - Array of Splitwise group IDs to fetch
 * @returns Promise resolving to a map of account ID → fetch result with rows and optional error
 */
export const fetchSplitwiseRows = async (
	accountIds: string[],
): Promise<Record<string, AccountFetchResult>> => {
	const results: Record<string, AccountFetchResult> = {};
	const userName = await getSplitwiseUserName();

	if (!userName) {
		const errorMsg =
			"Splitwise user name not available. Please visit Splitwise first to capture your user name.";
		console.error(errorMsg);
		// Return error state for all requested accounts
		for (const accountId of accountIds) {
			results[accountId] = { rows: [], error: errorMsg };
		}
		return results;
	}

	// Fetch data for each account ID in parallel
	await Promise.all(
		accountIds.map(async (accountId) => {
			try {
				const csvText = await fetchSplitwiseCsv(accountId);
				const rows = ingestSplitwiseCsvText(csvText, userName);
				results[accountId] = { rows };
			} catch (error) {
				const errorMsg = `Error fetching Splitwise data for account ${accountId}: ${error instanceof Error ? error.message : String(error)}`;
				console.error(errorMsg);
				results[accountId] = { rows: [], error: errorMsg };
			}
		}),
	);

	return results;
};

/**
 * Fetches and transforms Monarch transaction data for multiple accounts.
 *
 * @param accountIds - Array of Monarch account IDs to fetch
 * @returns Promise resolving to a map of account ID → fetch result with rows and optional error
 */
export const fetchMonarchRows = async (
	accountIds: string[],
): Promise<Record<string, AccountFetchResult>> => {
	const results: Record<string, AccountFetchResult> = {};

	// Fetch data for each account ID in parallel
	await Promise.all(
		accountIds.map(async (accountId) => {
			try {
				const csvText = await fetchMonarchCsv(accountId);
				const rows = ingestMonarchCsvText(csvText);
				results[accountId] = { rows };
			} catch (error) {
				const errorMsg = `Error fetching Monarch data for account ${accountId}: ${error instanceof Error ? error.message : String(error)}`;
				console.error(errorMsg);
				results[accountId] = { rows: [], error: errorMsg };
			}
		}),
	);

	return results;
};

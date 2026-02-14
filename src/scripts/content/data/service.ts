/**
 * Data service orchestrator.
 *
 * Provides high-level API for fetching and transforming transaction data.
 * Coordinates between fetcher and transformer modules to deliver
 * processed transaction data in the internal TvbRow format.
 */

import type { TvbRow } from "@/types";
import * as tokenManager from "../auth/token-manager";
import * as fetcher from "./fetcher";
import * as transformers from "./transformers";

/**
 * Fetches and transforms Splitwise transaction data for multiple accounts.
 *
 * @param accountIds - Array of Splitwise group IDs to fetch
 * @returns Promise resolving to a map of account ID → transaction rows
 */
export const fetchSplitwiseRows = async (
	accountIds: string[],
): Promise<Record<string, TvbRow[]>> => {
	const results: Record<string, TvbRow[]> = {};
	const userName = tokenManager.getSplitwiseUserName();

	if (!userName) {
		console.error(
			"Splitwise user name not available. Please visit Splitwise first to capture your user name.",
		);
		return results;
	}

	// Fetch data for each account ID in parallel
	await Promise.all(
		accountIds.map(async (accountId) => {
			try {
				const csvText = await fetcher.fetchSplitwiseCsv(accountId);
				results[accountId] = transformers.ingestSplitwiseCsvText(
					csvText,
					userName,
				);
			} catch (error) {
				console.error(
					`Error fetching Splitwise data for account ${accountId}:`,
					error,
				);
				results[accountId] = [];
			}
		}),
	);

	return results;
};

/**
 * Fetches and transforms Monarch transaction data for multiple accounts.
 *
 * @param accountIds - Array of Monarch account IDs to fetch
 * @returns Promise resolving to a map of account ID → transaction rows
 */
export const fetchMonarchRows = async (
	accountIds: string[],
): Promise<Record<string, TvbRow[]>> => {
	const results: Record<string, TvbRow[]> = {};

	// Fetch data for each account ID in parallel
	await Promise.all(
		accountIds.map(async (accountId) => {
			try {
				const csvText = await fetcher.fetchMonarchCsv(accountId);
				results[accountId] = transformers.ingestMonarchCsvText(csvText);
			} catch (error) {
				console.error(
					`Error fetching Monarch data for account ${accountId}:`,
					error,
				);
				results[accountId] = [];
			}
		}),
	);

	return results;
};

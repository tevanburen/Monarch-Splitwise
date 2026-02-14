/**
 * Data service orchestrator.
 *
 * Provides high-level API for fetching and transforming transaction data.
 * Coordinates between fetcher and transformer modules to deliver
 * processed transaction data in the internal TvbRow format.
 */

import type {
	AccountFetchResult,
	AccountUploadResult,
	MonarchRow,
	TvbRow,
} from "@/types";
import { getSplitwiseUserName } from "../auth";
import {
	clickElement,
	navigateToAccountPage,
	uploadFilesToInput,
} from "../interaction";
import { fetchMonarchCsv, fetchSplitwiseCsv } from "./fetcher";
import {
	ingestMonarchCsvText,
	ingestSplitwiseCsvText,
	rowsToCsvFile,
	tvbRowsToMonarchRows,
} from "./transformers";

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

/**
 * Uploads transaction rows to Monarch for multiple accounts.
 *
 * @param accountMap - Map of Monarch account IDs to transaction rows to upload
 * @returns Promise resolving to a map of account ID → upload result with optional error
 */
export const uploadMonarchRows = async (
	accountMap: Record<string, TvbRow[]>,
): Promise<Record<string, AccountUploadResult>> => {
	const results: Record<string, AccountUploadResult> = {};

	// Process each account sequentially to avoid UI conflicts
	for (const [accountId, rows] of Object.entries(accountMap)) {
		try {
			// Skip if no rows to upload
			if (rows.length === 0) {
				results[accountId] = {};
				continue;
			}

			// Make sure that dates are dates
			rows.forEach((row) => {
				if (typeof row.date === "string") {
					row.date = new Date(row.date);
				}
			});

			// Navigate to the account page
			const navigated = await navigateToAccountPage(accountId);
			if (!navigated) {
				results[accountId] = {
					error: `Failed to navigate to account page for ${accountId}`,
				};
				continue;
			}

			// Upload the rows
			const uploaded = await uploadRowsForAccount(accountId, rows);
			if (!uploaded) {
				results[accountId] = {
					error: `Failed to upload transactions for account ${accountId}`,
				};
				continue;
			}

			// Success
			results[accountId] = {};
		} catch (error) {
			const errorMsg = `Error uploading rows for account ${accountId}: ${error instanceof Error ? error.message : String(error)}`;
			console.error(errorMsg);
			results[accountId] = { error: errorMsg };
		}
	}

	return results;
};

/**
 * Converts transaction rows to Monarch format and uploads them via the UI.
 * Follows the Monarch import flow: Edit → Import → Upload → Steps → Import.
 *
 * @param rows - Array of transaction rows to upload
 * @returns True if upload was successful, false otherwise
 */
const uploadRowsForAccount = async (
	accountId: string,
	rows: TvbRow[],
): Promise<boolean> => {
	// Transform tvb to monarch
	const monarchRows = tvbRowsToMonarchRows(rows);

	// Write to a file
	const newFile = rowsToCsvFile(monarchRows, "Monarch-Splitwise.csv", [
		"Date",
		"Merchant",
		"Category",
		"Account",
		"Original Statement",
		"Notes",
		"Amount",
		"Tags",
	] satisfies (keyof MonarchRow)[]);

	// Navigate through the Monarch import flow (as of January 2026)
	return Boolean(
		// Start import flow
		(await clickElement("button", /^Edit[\s\W]*$/)) &&
			(await clickElement("div", /^Import transactions$/)) &&
			// Upload the file
			(await uploadFilesToInput(newFile)) &&
			// Go through import steps
			(await clickElement<HTMLButtonElement>("button", /^Next$/)) && // Column mapping
			(await clickElement<HTMLButtonElement>("button", /^Next$/)) && // Tags
			(await clickElement<HTMLButtonElement>("button", /^Next$/)) && // Categories
			(await clickElement<HTMLButtonElement>("button", /^Next$/)) && // Priorities
			// Configure import options
			(await clickElement<HTMLButtonElement>(
				"span",
				/^Prioritize Monarch transactions$/,
			)) &&
			(await clickElement<HTMLButtonElement>(
				"input",
				/^shouldUpdateBalance$/,
			)) &&
			// Complete import
			(await clickElement<HTMLButtonElement>(
				"button",
				/^Import \d+ transactions$/,
			)) &&
			// Navigate back to accounts overview
			(await clickElement("button", /^View cash flow report$/)) &&
			(await navigateToAccountPage(accountId)),
	);
};

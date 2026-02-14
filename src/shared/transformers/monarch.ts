/**
 * Monarch data transformation utilities.
 * Converts between Monarch CSV format and internal transaction format.
 */

import type {
	MonarchBalanceRow,
	MonarchRow,
	TvbBalanceRow,
	TvbRow,
} from "@/types";

/**
 * Converts Monarch CSV rows to internal transaction format.
 *
 * @param rows - Array of Monarch CSV rows
 * @returns Array of normalized transaction rows
 */
export const monarchRowsToTvbRows = (rows: MonarchRow[]): TvbRow[] => {
	const rowToRow = (row: MonarchRow): TvbRow => ({
		date: new Date(row.Date),
		delta: row.Amount,
		description: row.Notes,
	});
	return rows.map(rowToRow);
};

/**
 * Converts internal transaction rows to Monarch CSV format for uploading.
 *
 * @param rows - Array of normalized transaction rows
 * @returns Array of Monarch-formatted rows ready for CSV export
 */
export const tvbRowsToMonarchRows = (rows: TvbRow[]): MonarchRow[] => {
	const rowToRow = (row: TvbRow): MonarchRow => ({
		Date: dateToString(row.date),
		Amount: row.delta,
		Notes: row.description,
		Account: "",
		Merchant: "Splitwise",
		Category: "Uncategorized",
		Tags: "",
		"Original Statement": "",
	});
	return rows.map(rowToRow);
};

/**
 * Converts balance history to Monarch format, adding a current-date row.
 *
 * @param rows - Array of balance rows
 * @returns Array of Monarch-formatted balance rows ready for CSV export
 */
const _tvbBalanceRowsToMonarchBalanceRows = (
	rows: TvbBalanceRow[],
): MonarchBalanceRow[] =>
	[
		...rows,
		{
			date: new Date(),
			balance: rows[rows.length - 1]?.balance ?? 0,
		} satisfies TvbBalanceRow,
	].map((row) => ({
		Date: dateToString(row.date),
		Balance: row.balance,
		Account: "",
	}));

/**
 * Converts a Date object to ISO date string (YYYY-MM-DD).
 *
 * @param date - The date to convert
 * @returns ISO formatted date string
 */
const dateToString = (date: Date): string => date.toISOString().split("T")[0];

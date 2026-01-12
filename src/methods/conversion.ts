import { read as XLSXread, utils as XLSXutils } from "xlsx";
import type {
	MonarchBalanceRow,
	MonarchRow,
	SplitwiseRow,
	TvbBalanceRow,
	TvbRow,
} from "@/types";

/**
 * Converts Splitwise CSV rows to internal transaction format.
 * Filters for transactions involving the specified member.
 *
 * @param rows - Array of Splitwise CSV rows
 * @param memberName - The member name to extract transactions for
 * @returns Array of normalized transaction rows
 */
export const splitwiseRowsToTvbRows = (
	rows: SplitwiseRow[],
	memberName: string,
): TvbRow[] => {
	const rowToRow = (row: SplitwiseRow): TvbRow => ({
		date: row.Date,
		delta: row[memberName],
		description: row.Description,
	});
	return rows.map(rowToRow);
};

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
 * Converts a Date object to ISO date string (YYYY-MM-DD).
 *
 * @param date - The date to convert
 * @returns ISO formatted date string
 */
const dateToString = (date: Date): string => date.toISOString().split("T")[0];

/**
 * Parses CSV text into an array of typed objects.
 *
 * @template K - The expected type of each row object
 * @param text - The CSV text content
 * @returns Array of parsed row objects
 */
export const csvTextToRows = <K>(text: string): K[] => {
	const workbook = XLSXread(text, { type: "string", cellDates: true });
	return XLSXutils.sheet_to_json<K>(workbook.Sheets[workbook.SheetNames[0]]);
};

/**
 * Comparison function for sorting transaction rows.
 * Compares by date first, then amount, then description.
 *
 * @param rowA - First row to compare
 * @param rowB - Second row to compare
 * @returns Negative if rowA < rowB, 0 if equal, positive if rowA > rowB
 */
export const compareTvbRows = (rowA: TvbRow, rowB: TvbRow): number =>
	rowA.date.getTime() - rowB.date.getTime() ||
	rowA.delta - rowB.delta ||
	rowA.description.localeCompare(rowB.description);

/**
 * Converts transaction rows into a running balance history.
 * Sorts transactions chronologically and calculates cumulative balance.
 * Deduplicates consecutive rows with identical balances.
 *
 * @param rows - Array of transaction rows
 * @returns Array of balance rows showing balance at each date
 */
export const tvbRowsToTvbBalanceRows = (rows: TvbRow[]): TvbBalanceRow[] =>
	rows
		.toSorted(compareTvbRows)
		.reduce((out: TvbBalanceRow[], currRow) => {
			const lastRow: TvbBalanceRow | undefined = out[out.length - 1];
			const newBalance =
				Math.round(((lastRow?.balance ?? 0) + currRow.delta) * 100) / 100;
			if (lastRow?.date.getTime() === currRow.date.getTime()) {
				lastRow.balance = newBalance;
			} else {
				out.push({ date: currRow.date, balance: newBalance });
			}
			return out;
		}, [])
		.filter((row, index, arr) => row.balance !== arr[index - 1]?.balance);

/**
 * Converts balance history to Monarch format, adding a current-date row.
 *
 * @param rows - Array of balance rows
 * @returns Array of Monarch-formatted balance rows ready for CSV export
 */
export const tvbBalanceRowsToMonarchBalanceRows = (
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

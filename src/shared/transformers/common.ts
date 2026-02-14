/**
 * Common transformation utilities shared across different data sources.
 * Provides CSV parsing, sorting, and balance calculation functions.
 */

import { read as XLSXread, utils as XLSXutils } from "xlsx";
import type { TvbBalanceRow, TvbRow } from "@/types";

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
const compareTvbRows = (rowA: TvbRow, rowB: TvbRow): number =>
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
const _tvbRowsToTvbBalanceRows = (rows: TvbRow[]): TvbBalanceRow[] =>
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

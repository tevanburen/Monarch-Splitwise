/**
 * Splitwise data transformation utilities.
 * Converts Splitwise CSV data to internal transaction format.
 */

import type { SplitwiseRow, TvbRow } from "@/types";

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

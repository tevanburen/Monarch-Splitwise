/**
 * Data transformation utilities for converting between CSV formats.
 *
 * Handles parsing CSV text and transforming between different row formats:
 * - Splitwise CSV → TvbRow (internal format)
 * - Monarch CSV → TvbRow (internal format)
 * - TvbRow → Monarch CSV (for uploading)
 */

import { read as XLSXread, utils as XLSXutils } from "xlsx";
import type { MonarchRow, SplitwiseRow, TvbRow } from "@/types";

/**
 * Parses CSV text into an array of typed objects.
 *
 * @template K - The expected type of each row object
 * @param text - The CSV text content
 * @returns Array of parsed row objects
 */
const csvTextToRows = <K>(text: string): K[] => {
	const workbook = XLSXread(text, { type: "string", cellDates: true });
	return XLSXutils.sheet_to_json<K>(workbook.Sheets[workbook.SheetNames[0]]);
};

/**
 * Converts Splitwise CSV rows to internal transaction format.
 *
 * @param rows - Array of Splitwise CSV rows
 * @param memberName - The member name to extract transactions for
 * @returns Array of normalized transaction rows
 */
const splitwiseRowsToTvbRows = (
	rows: SplitwiseRow[],
	memberName: string,
): TvbRow[] => {
	const rowToRow = (row: SplitwiseRow): TvbRow => ({
		date: new Date(row.Date),
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
const monarchRowsToTvbRows = (rows: MonarchRow[]): TvbRow[] => {
	const rowToRow = (row: MonarchRow): TvbRow => ({
		date: new Date(row.Date),
		delta: row.Amount,
		description: row.Notes,
	});
	return rows.map(rowToRow);
};

/**
 * Processes Splitwise CSV text, filtering for transactions involving the specified member.
 *
 * @param csvText - The Splitwise CSV text to process
 * @param memberName - The name of the member to filter transactions for
 * @returns Array of transaction rows involving the specified member
 */
export const ingestSplitwiseCsvText = (
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
 * Processes Monarch CSV text data into transaction rows.
 *
 * @param csvText - The CSV text content from Monarch
 * @returns Array of transaction rows
 */
export const ingestMonarchCsvText = (csvText: string): TvbRow[] => {
	// Parse CSV text to Monarch rows
	const monarchArr = csvTextToRows<MonarchRow>(csvText);

	// Transform Monarch to tvb
	const tvbArr = monarchRowsToTvbRows(monarchArr);

	return tvbArr;
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
 * Converts an array of objects to a CSV file.
 *
 * @param rows - Array of objects to convert
 * @param fileName - Name for the generated file
 * @param columns - Optional array of column names to include and their order
 * @returns File object containing CSV data
 */
export const rowsToCsvFile = (
	rows: unknown[],
	fileName: string,
	columns?: string[],
): File => {
	const worksheet = XLSXutils.json_to_sheet(rows, {
		header: columns,
		skipHeader: false,
	});
	const csv = XLSXutils.sheet_to_csv(worksheet);
	return new File([csv], fileName, {
		type: "text/csv",
	});
};

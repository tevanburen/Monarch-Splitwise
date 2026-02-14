import { utils as XLSXutils } from "xlsx";

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

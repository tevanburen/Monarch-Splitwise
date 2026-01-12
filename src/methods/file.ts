import { read as XLSXread, utils as XLSXutils } from "xlsx";

/**
 * Reads a CSV file and parses it into an array of typed objects.
 * Automatically parses date values.
 *
 * @template R - The expected type of each row object
 * @param file - The CSV file to read
 * @returns Promise resolving to an array of parsed row objects
 */
export const csvFileToRows = async <R>(file: File): Promise<R[]> => {
	const workbook = XLSXread(await file.arrayBuffer(), { cellDates: true });

	const arr = XLSXutils.sheet_to_json(
		workbook.Sheets[workbook.SheetNames[0]],
	) as R[];

	return arr;
};

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

/**
 * Triggers a browser download of a file.
 * Creates a temporary anchor element to initiate the download, then cleans up.
 *
 * @param file - The file to download
 */
export const downloadFile = (file: File): void => {
	const url = URL.createObjectURL(file);
	const a = document.createElement("a");

	a.href = URL.createObjectURL(file);
	a.download = file.name;
	a.style.display = "none";

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	// Clean up the object URL to avoid memory leaks
	URL.revokeObjectURL(url);
};

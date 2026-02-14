import {
	clickElement,
	clickLink,
	compareTvbRows,
	fetchMonarchCsv,
	rowsToCsvFile,
	tvbRowsToMonarchRows,
	tvbRowsToTvbBalanceRows,
	uploadFilesToInput,
} from "@/methods";
import type {
	MonarchRow,
	TvbAccount,
	TvbAccountStatus,
	TvbBalanceRow,
	TvbRow,
} from "@/types";
import { removeSimilarRows, spliceElementsBS } from "./algo";

/**
 * Processes an account by fetching old transactions, reading new Splitwise data,
 * uploading transactions and balance history to Monarch.
 *
 * @param account - The account configuration to process
 * @param files - Array of Splitwise CSV files to process
 * @param authToken - Authentication token for Monarch API
 * @returns Status object indicating success/failure of attempted operations
 */
export const driveAccount = async (
	account: TvbAccount,
	files: File[],
	authToken: string,
	splitwiseName: string,
): Promise<TvbAccountStatus> => {
	const response: TvbAccountStatus = {
		attempted: false,
		transactions: false,
		balances: false,
	};

	// find index of matching file
	const fileIndex = files.findIndex(
		(file) =>
			file.name.substring(0, account.splitwiseName.length).toLowerCase() ===
			account.splitwiseName.toLowerCase().replaceAll(" ", "-"),
	);

	// return if no matching file
	if (fileIndex === -1) {
		console.log(`No files found for Splitwise Name: ${account.splitwiseName}`);
		return response;
	}

	// we are now making an attempt
	response.attempted = true;

	// get ready to add new charges
	const [oldRows, [newRows], onPage] = await Promise.all([
		// fetch old rows
		buildOldRows(account.monarchId, authToken),
		// read new row file
		buildNewRows(files[fileIndex], splitwiseName),
		// get to account page
		navigateToPage(account.monarchId),
	]);
	// remove this file from the list
	files.splice(fileIndex, 1);

	// return if couldn't navigate to page
	if (!onPage) return response;

	// trim rows to startDate
	if (account.startDate) {
		spliceElementsBS<TvbRow, Date>(
			oldRows,
			(row) => row.date,
			new Date(account.startDate),
			(a, b) => a.getTime() - b.getTime(),
		);
		spliceElementsBS<TvbRow, Date>(
			newRows,
			(row) => row.date,
			new Date(account.startDate),
			(a, b) => a.getTime() - b.getTime(),
		);
	}

	// console.log(
	//   JSON.stringify({
	//     newRows,
	//     oldRows,
	//     balanceRows,
	//   })
	// );

	// remove similar rows;
	removeSimilarRows(newRows, oldRows);

	// warn of floating old charges
	if (oldRows.length) {
		console.warn("The following rows are unmatched:", oldRows);
	}

	// console.log(
	//   JSON.stringify({
	//     newRows,
	//     oldRows,
	//     balanceRows,
	//   })
	// );

	// upload new rows to monarch
	if (newRows.length) {
		response.transactions = await uploadRowsToMonarch(newRows);
		// for now, attempt to navigate back to account, and mark balances as done
		response.balances =
			(await clickElement("button", /^View cash flow report$/)) &&
			(await navigateToPage(account.monarchId));
	} else {
		// response.transactions = true;
		response.balances = await navigateToPage(account.monarchId);
	}

	// return if fail during update
	if (!response.transactions) return response;

	// bridge the gap
	// no longer needed as of January 2026 due to Monarch changes
	// // const [transactionsDone, balancesStarted] = await bridgeTransactionsBalance();
	// // if (!balancesStarted) {
	// // 	response.transactions = transactionsDone;
	// // 	return response;
	// // }

	// // upload balance rows
	// response.balances = await uploadBalanceRowsToMonarch(balanceRows);

	return response;
};

/**
 * Fetches and processes existing transaction rows from Monarch.
 *
 * @param monarchId - The Monarch account ID
 * @param authToken - Authentication token for Monarch API
 * @returns Sorted array of existing transaction rows
 */
const buildOldRows = async (
	monarchId: string,
	authToken: string,
): Promise<TvbRow[]> => {
	// fetch monarchText
	const monarchText = await fetchMonarchCsv(monarchId, authToken);

	// read monarch rows
	const oldRows = ingestMonarchCsvText(monarchText);

	return oldRows.sort(compareTvbRows);
};
/**
 * Processes a Splitwise CSV file to extract transaction and balance rows.
 *
 * @param splitwiseFile - The Splitwise CSV file to process
 * @param splitwiseName - The Splitwise member name to filter transactions for
 * @returns Tuple containing sorted transaction rows and balance rows
 */ const buildNewRows = async (
	splitwiseFile: File,
	splitwiseName: string,
): Promise<[TvbRow[], TvbBalanceRow[]]> => {
	// read splitwise rows
	const newRows = await ingestSplitwiseCsvFile(splitwiseFile, splitwiseName);

	return [newRows.sort(compareTvbRows), tvbRowsToTvbBalanceRows(newRows)];
};

/**
 * Navigates to the account details page in Monarch.
 *
 * @param monarchId - The Monarch account ID to navigate to
 * @returns True if navigation was successful, false otherwise
 */
const navigateToPage = async (monarchId: string): Promise<boolean> => {
	const target = `/accounts/details/${monarchId}`;
	const accountsTarget = "/accounts";
	return Boolean(
		window.location.pathname === target ||
			((window.location.pathname === accountsTarget ||
				(await clickLink(accountsTarget))) &&
				(await clickLink(target))),
	);
};

/**
 * Converts transaction rows to Monarch format and uploads them via the UI.
 *
 * @param rows - Array of transaction rows to upload
 * @returns True if upload was successful, false otherwise
 */
const uploadRowsToMonarch = async (rows: TvbRow[]): Promise<boolean> => {
	// transform tvb to monarch
	const monarchRows = tvbRowsToMonarchRows(rows);

	// write to a file
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

	// Old flow before January 2026

	// open the modal
	// return Boolean(
	// 	(await clickElement("button", /^Edit[\s\W]*$/)) &&
	// 		(await clickElement("div", /^Import transactions$/)) &&
	// 		// drop in the file
	// 		(await uploadFilesToInput(newFile)) &&
	// 		// check the box
	// 		// (await clickElement(`input[type="checkbox"]`)) &&
	// 		// hit go
	// 		(await clickElement<HTMLButtonElement>("button", /^Add to account$/)),
	// 	// here we may need to resubmit but handled by the bridge function
	// );

	// Navigate to the page
	return Boolean(
		(await clickElement("button", /^Edit[\s\W]*$/)) &&
			(await clickElement("div", /^Import transactions$/)) &&
			// drop in the file
			(await uploadFilesToInput(newFile)) &&
			// Go to the column mapping step
			(await clickElement<HTMLButtonElement>("button", /^Next$/)) &&
			// Go to the tags step
			(await clickElement<HTMLButtonElement>("button", /^Next$/)) &&
			// Go to the categories step
			(await clickElement<HTMLButtonElement>("button", /^Next$/)) &&
			// Go to the priorities step
			(await clickElement<HTMLButtonElement>("button", /^Next$/)) &&
			// Prioritize monarch
			(await clickElement<HTMLButtonElement>(
				"span",
				/^Prioritize Monarch transactions$/,
			)) &&
			// Click adjust balances
			(await clickElement<HTMLButtonElement>(
				"input",
				/^shouldUpdateBalance$/,
			)) &&
			// Click Import
			(await clickElement<HTMLButtonElement>(
				"button",
				/^Import \d+ transactions$/,
			)),
	);
};

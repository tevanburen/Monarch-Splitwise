/**
 * Represents a row from a Splitwise CSV export.
 * Includes dynamic properties for each group member's share.
 */
export type SplitwiseRow = {
	Category: string;
	Cost: number;
	Currency: string;
	Date: Date;
	Description: string;
} & {
	[memberName: string]: number;
};

/**
 * Internal normalized transaction row format.
 * Used as an intermediate representation between Splitwise and Monarch.
 */
export interface TvbRow {
	date: Date;
	delta: number;
	description: string;
}

/**
 * Result of fetching transaction data for a single account.
 * Includes both the data and optional error information.
 */
export type AccountFetchResult = {
	/** Transaction rows for this account */
	rows: TvbRow[];
	/** Error message if fetch failed, undefined if successful */
	error?: string;
};

/**
 * Represents a row in Monarch's transaction CSV format.
 * Contains fixed values for certain fields specific to Splitwise imports.
 */
export interface MonarchRow {
	Date: string;
	Merchant: "Splitwise";
	Category: "Uncategorized";
	Account: "";
	"Original Statement": "";
	Notes: string;
	Amount: number;
	Tags: "";
}

/**
 * Internal balance history entry.
 * Represents the account balance at a specific date.
 */
export interface TvbBalanceRow {
	date: Date;
	balance: number;
}

/**
 * Represents a row in Monarch's balance history CSV format.
 */
export interface MonarchBalanceRow {
	Date: string;
	Balance: number;
	Account: "";
}

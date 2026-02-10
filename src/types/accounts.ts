/**
 * Configuration for a single account that links Monarch and Splitwise.
 */
export interface TvbAccount {
	accountName: string;
	monarchId: string;
	splitwiseId: string;
	startDate: string | null;
	inactive?: boolean;
}

/**
 * Status tracking for an account processing operation.
 * Indicates which steps were attempted and their success/failure state.
 */
export interface TvbAccountStatus {
	transactions?: boolean;
	balances?: boolean;
	attempted: boolean;
}

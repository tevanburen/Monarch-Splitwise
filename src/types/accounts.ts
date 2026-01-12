/**
 * Configuration for a single account that links Monarch and Splitwise.
 */
export interface TvbAccount {
	monarchName: string;
	splitwiseName: string;
	monarchId: string;
	startDate: string | null;
	invisible?: boolean;
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

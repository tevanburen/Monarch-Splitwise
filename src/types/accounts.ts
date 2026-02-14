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

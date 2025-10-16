export interface TvbAccount {
	monarchName: string;
	splitwiseName: string;
	monarchId: string;
	startDate: string | null;
	invisible?: boolean;
}

export interface TvbAccountStatus {
	transactions?: boolean;
	balances?: boolean;
	attempted: boolean;
}

export interface TvbAccount {
  monarchName: string;
  splitwiseName: string;
  monarchId: string;
  startDate: string | null;
}

export interface TvbAccountStatus {
  transactions?: boolean;
  balances?: boolean;
  attempted: boolean;
}

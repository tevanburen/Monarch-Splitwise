export type SplitwiseRow = {
  Category: string;
  Cost: number;
  Currency: string;
  Date: Date;
  Description: string;
} & {
  [memberName: string]: number;
};

export interface TvbRow {
  date: Date;
  delta: number;
  description: string;
}

export interface MonarchRow {
  Date: string;
  Merchant: 'Splitwise';
  Category: 'Uncategorized';
  Account: string;
  'Original Statement': '';
  Notes: string;
  Amount: number;
  Tags: '';
}

export interface TvbBalanceRow {
  date: Date;
  balance: number;
}

export interface MonarchBalanceRow {
  Date: string;
  Balance: number;
  Account: string;
}

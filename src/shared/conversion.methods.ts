import {
  MonarchBalanceRow,
  MonarchRow,
  SplitwiseRow,
  TvbBalanceRow,
  TvbRow,
} from './shared.types';
import * as XLSX from 'xlsx';

export const splitwiseRowsToTvbRows = (
  rows: SplitwiseRow[],
  memberName: string
): TvbRow[] => {
  const rowToRow = (row: SplitwiseRow): TvbRow => ({
    date: row.Date,
    delta: row[memberName],
    description: row.Description,
  });
  return rows.map(rowToRow);
};

export const monarchRowsToTvbRows = (rows: MonarchRow[]): TvbRow[] => {
  const rowToRow = (row: MonarchRow): TvbRow => ({
    date: new Date(row.Date),
    delta: row.Amount,
    description: row.Notes,
  });
  return rows.map(rowToRow);
};

export const tvbRowsToMonarchRows = (
  rows: TvbRow[],
  accountName: string
): MonarchRow[] => {
  const rowToRow = (row: TvbRow): MonarchRow => ({
    Date: dateToString(row.date),
    Amount: row.delta,
    Notes: row.description,
    Account: accountName,
    Merchant: 'Splitwise',
    Category: 'Uncategorized',
    Tags: '',
    'Original Statement': '',
  });
  return rows.map(rowToRow);
};

const dateToString = (date: Date): string => date.toISOString().split('T')[0];

export const csvTextToRows = <K>(text: string): K[] => {
  const workbook = XLSX.read(text, { type: 'string', cellDates: true });
  return XLSX.utils.sheet_to_json<K>(workbook.Sheets[workbook.SheetNames[0]]);
};

export const compareTvbRows = (rowA: TvbRow, rowB: TvbRow): number =>
  rowA.date.getTime() - rowB.date.getTime() ||
  rowA.delta - rowB.delta ||
  rowA.description.localeCompare(rowB.description);

export const tvbRowsToTvbBalanceRows = (rows: TvbRow[]): TvbBalanceRow[] =>
  rows
    .toSorted(compareTvbRows)
    .reduce((out: TvbBalanceRow[], currRow) => {
      const lastRow: TvbBalanceRow | undefined = out[out.length - 1];
      const newBalance =
        Math.round(((lastRow?.balance ?? 0) + currRow.delta) * 100) / 100;
      if (lastRow?.date.getTime() === currRow.date.getTime()) {
        lastRow.balance = newBalance;
      } else {
        out.push({ date: currRow.date, balance: newBalance });
      }
      return out;
    }, [])
    .filter((row, index, arr) => row.balance !== arr[index - 1]?.balance);

export const tvbBalanceRowsToMonarchBalanceRows = (
  rows: TvbBalanceRow[],
  account: string
): MonarchBalanceRow[] =>
  [...rows, {
    date: new Date(),
    balance: rows[rows.length - 1]?.balance ?? 0,
  } satisfies TvbBalanceRow].map((row) => ({
    Date: dateToString(row.date),
    Balance: row.balance,
    Account: account,
  }));

import { MonarchRow, SplitwiseRow, TvbRow } from './types';
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

import { csvToRows, rowsToCsv, uploadFilesToInput } from '@/components';
import { MonarchRow, SplitwiseRow, TvbRow } from './widget.types';

export const tmpDriver = async (file: File) => {
  // read splitwise rows
  let rows = await ingestSplitwiseCsv(file, 'Thomas Van Buren');

  // use most recent 3 for now
  rows = rows.slice(-3);

  // upload to monarch
  uploadRowsToMonarch(rows);
};

const ingestSplitwiseCsv = async (
  file: File,
  memberName: string
): Promise<TvbRow[]> => {
  // read splitwise rows
  const splitwiseArr = await csvToRows<SplitwiseRow>(file);

  // need to remove the "total balance" row
  splitwiseArr.pop();

  // transform splitwise to tvb
  const tvbArr = splitwiseRowsToTvbRows(splitwiseArr, memberName);

  // filter out charges that don't involve me
  return tvbArr.filter((row) => row.delta);
};

const splitwiseRowsToTvbRows = (
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

const uploadRowsToMonarch = (rows: TvbRow[]) => {
  // transform tvb to monarch
  const monarchRows = tvbRowsToMonarchRows(rows, 'The Upper');

  // write to a file
  const newFile = rowsToCsv(monarchRows, 'test.csv', [
    'Date',
    'Merchant',
    'Category',
    'Account',
    'Original Statement',
    'Notes',
    'Amount',
    'Tags',
  ] satisfies (keyof MonarchRow)[]);
  console.log(newFile);

  // drop it in
  uploadFilesToInput([newFile]);
  // downloadFile(newFile);
};

const tvbRowsToMonarchRows = (
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

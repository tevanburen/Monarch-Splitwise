import * as XLSX from 'xlsx';
import { MonarchRow, SplitwiseRow, TvbRow } from './widget.types';

export const tmpDriver = async (file: File) => {
  const splitwiseArr = await csvToJson<SplitwiseRow>(file);
  // need to remove the "total balance" row
  console.log(splitwiseArr);
  splitwiseArr.pop();
  const tvbArr = splitwiseToTvb(splitwiseArr, 'Thomas Van Buren');
  console.log(tvbArr);
  const monarchArr = tvbToMonarch(tvbArr, 'The Upper');
  console.log(monarchArr);
};

const csvToJson = async <R>(file: File): Promise<R[]> => {
  const workbook = XLSX.read(await file.arrayBuffer(), { cellDates: true });

  const arr = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  ) as R[];

  return arr;
};

const splitwiseToTvb = (rows: SplitwiseRow[], memberName: string): TvbRow[] => {
  const rowToRow = (row: SplitwiseRow): TvbRow => ({
    date: row.Date,
    delta: row[memberName],
    description: row.Description,
  });
  return rows.map(rowToRow);
};

const tvbToMonarch = (rows: TvbRow[], accountName: string): MonarchRow[] => {
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

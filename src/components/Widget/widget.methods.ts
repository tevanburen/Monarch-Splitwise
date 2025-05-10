import {
  csvToRows,
  monarchRowsToTvbRows,
  rowsToCsv,
  splitwiseRowsToTvbRows,
  tvbRowsToMonarchRows,
  uploadFilesToInput,
} from '@/components';
import { MonarchRow, SplitwiseRow, TvbRow } from '../shared/types';

export const tmpDriver = async (files: File[]) => {
  // decipher files
  if (files.length !== 2) return;
  const splitwiseFile = files.find(
    (file) => !file.name.includes('transactions')
  );
  const monarchFile = files.find((file) => file.name.includes('transactions'));
  if (!splitwiseFile || !monarchFile) return;

  // read splitwise rows
  let newRows = await ingestSplitwiseCsv(splitwiseFile, 'Thomas Van Buren');

  // use most recent 3 for now
  newRows = newRows.slice(-3);

  // read monarch rows
  const oldRows = await ingestMonarchCsv(monarchFile);
  console.log(oldRows);

  // upload to monarch
  // uploadRowsToMonarch(newRows);
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

const ingestMonarchCsv = async (file: File): Promise<TvbRow[]> => {
  // read splitwise rows
  const splitwiseArr = await csvToRows<MonarchRow>(file);

  // transform splitwise to tvb
  const tvbArr = monarchRowsToTvbRows(splitwiseArr);

  return tvbArr;
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

  // drop it in
  uploadFilesToInput(newFile);
  // downloadFile(newFile);
};

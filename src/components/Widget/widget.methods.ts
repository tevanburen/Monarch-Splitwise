import {
  csvToRows,
  rowsToCsv,
  splitwiseRowsToTvbRows,
  tvbRowsToMonarchRows,
  uploadFilesToInput,
} from '@/components';
import { MonarchRow, SplitwiseRow, TvbRow } from '../shared/types';

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

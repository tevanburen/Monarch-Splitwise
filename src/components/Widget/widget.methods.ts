import {
  clickElement,
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
  const newRows = await ingestSplitwiseCsv(splitwiseFile, 'Thomas Van Buren');

  // read monarch rows
  const oldRows = await ingestMonarchCsv(monarchFile);

  // remove similar rows;
  removeSimilarRows(newRows, oldRows);

  // warn of floating old charges
  if (oldRows.length) {
    console.warn('The following rows are unmatched:', oldRows);
  }

  // upload new rows to monarch
  uploadRowsToMonarch(newRows);
};

const ingestSplitwiseCsv = async (
  file: File,
  memberName: string
): Promise<TvbRow[]> => {
  // read splitwise rows
  const splitwiseArr = await csvToRows<SplitwiseRow>(file);

  // need to remove the "total balance" row
  splitwiseArr.pop();

  // need to clean the strings otherwise Monarch throws a fit
  splitwiseArr.forEach(
    (row) => (row.Description = row.Description.replace(/[^a-zA-Z0-9 ]+/g, ''))
  );

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

  // open the modal
  clickElement('button', /^Edit[\s\W]*$/);
  clickElement('div', /^Upload transactions$/, true);

  // drop in the file
  uploadFilesToInput(newFile);
  // downloadFile(newFile);
};

const compareRows = (rowA: TvbRow, rowB: TvbRow): number =>
  rowA.date.getTime() - rowB.date.getTime() ||
  rowA.delta - rowB.delta ||
  rowA.description.localeCompare(rowB.description);

const removeSimilarRows = (rowsA: TvbRow[], rowsB: TvbRow[]) => {
  // sort both arrays
  // these are sorted a->z
  rowsA.sort(compareRows);
  rowsB.sort(compareRows);

  // declare holders for popped items
  // these will be z->a
  const uniqueA: TvbRow[] = [];
  const uniqueB: TvbRow[] = [];

  while (rowsA.length && rowsB.length) {
    const comparison = compareRows(
      rowsA[rowsA.length - 1],
      rowsB[rowsB.length - 1]
    );
    if (comparison < 0) {
      // a < b, so b is unique
      uniqueB.push(rowsB.pop() as TvbRow);
    } else if (comparison > 0) {
      // a > b, so a is unique
      uniqueA.push(rowsA.pop() as TvbRow);
    } else {
      // a === b, so remove both
      rowsA.pop();
      rowsB.pop();
    }
  }

  // add unique back
  // flip the uniques because they are z->a
  rowsA.push(...uniqueA.reverse());
  rowsB.push(...uniqueB.reverse());
};

import {
  clickElement,
  compareTvbRows,
  csvFileToRows,
  csvTextToRows,
  monarchRowsToTvbRows,
  rowsToCsvFile,
  splitwiseRowsToTvbRows,
  tvbBalanceRowsToMonarchBalanceRows,
  tvbRowsToMonarchRows,
  tvbRowsToTvbBalanceRows,
  uploadFilesToInput,
} from '@/methods';
import {
  MonarchBalanceRow,
  MonarchRow,
  SplitwiseRow,
  TvbAccount,
  TvbBalanceRow,
  TvbRow,
} from '@/types';
import { fetchMonarchCsv } from '@/api';

export const tmpDriver = async (
  files: File[],
  tvbAccounts: TvbAccount[],
  authToken: string
): Promise<Record<string, boolean>> => {
  // decipher files
  const results: Record<string, boolean> = Object.values(tvbAccounts).reduce(
    (acc, curr) => ({ ...acc, [curr.monarchId]: false }),
    {}
  );

  const keepGoing = async (account: TvbAccount): Promise<boolean> => {
    const fileIndex = files.findIndex(
      (file) =>
        file.name.substring(0, account.splitwiseName.length).toLowerCase() ===
        account.splitwiseName.toLowerCase().replaceAll(' ', '-')
    );

    if (fileIndex === -1) {
      return false;
    }

    const success = await driveAccount(files[fileIndex], account, authToken);

    if (success) {
      results[account.monarchId] = true;
      delete files[fileIndex];
      return true;
    } else {
      return false;
    }
  };

  for (let i = 0; i < tvbAccounts.length; i++) {
    if (!(await keepGoing(tvbAccounts[i]))) break;
  }
  return results;
};

const driveAccount = async (
  splitwiseFile: File,
  tvbAccount: TvbAccount,
  authToken: string
): Promise<boolean> => {
  // fetch monarchText
  const monarchText = await fetchMonarchCsv(tvbAccount.monarchId, authToken);

  // read splitwise rows
  const newRows = await ingestSplitwiseCsvFile(
    splitwiseFile,
    'Thomas Van Buren'
  );

  // read monarch rows
  const oldRows = await ingestMonarchCsvText(monarchText);

  // sort both
  oldRows.sort(compareTvbRows);
  newRows.sort(compareTvbRows);

  // build new balance history
  const balanceRows = tvbRowsToTvbBalanceRows(newRows);

  // remove similar rows;
  removeSimilarRows(newRows, oldRows);

  // warn of floating old charges
  if (oldRows.length) {
    console.warn('The following rows are unmatched:', oldRows);
  }

  // upload new rows to monarch
  if (newRows.length) {
    await uploadRowsToMonarch(newRows);
  } else {
    console.log('Monarch looks up to date');
  }

  // upload balance rows
  if (!oldRows.length) {
    await uploadBalanceRowsToMonarch(balanceRows);
  }

  return true;
};

const ingestSplitwiseCsvFile = async (
  file: File,
  memberName: string
): Promise<TvbRow[]> => {
  // read splitwise rows
  const splitwiseArr = await csvFileToRows<SplitwiseRow>(file);

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

/**
 * @deprecated
 */
const _ingestMonarchCsvFile = async (file: File): Promise<TvbRow[]> => {
  // read splitwise rows
  const splitwiseArr = await csvFileToRows<MonarchRow>(file);

  // transform splitwise to tvb
  const tvbArr = monarchRowsToTvbRows(splitwiseArr);

  return tvbArr;
};

const ingestMonarchCsvText = async (text: string): Promise<TvbRow[]> => {
  // read splitwise rows
  const splitwiseArr = await csvTextToRows<MonarchRow>(text);

  // transform splitwise to tvb
  const tvbArr = monarchRowsToTvbRows(splitwiseArr);

  return tvbArr;
};

const uploadRowsToMonarch = async (rows: TvbRow[]): Promise<boolean> => {
  // transform tvb to monarch
  const monarchRows = tvbRowsToMonarchRows(rows);

  // write to a file
  const newFile = rowsToCsvFile(monarchRows, 'Monarch-Splitwise.csv', [
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
  return Boolean(
    (await clickElement('button', /^Edit[\s\W]*$/)) &&
      (await clickElement('div', /^Upload transactions$/)) &&
      // drop in the file
      (await uploadFilesToInput(newFile)) &&
      // check the box
      // (await clickElement(`input[type="checkbox"]`)) &&
      // hit go
      (await clickElement<HTMLButtonElement>('button', /^Add to account$/)) &&
      // hit go
      (await clickElement<HTMLButtonElement>('button', /^Confirm$/, 5000))
  );
};

const uploadBalanceRowsToMonarch = async (
  rows: TvbBalanceRow[]
): Promise<boolean> => {
  // transform tvb to monarch
  const monarchRows = tvbBalanceRowsToMonarchBalanceRows(rows);

  // write to a file
  const newFile = rowsToCsvFile(monarchRows, 'Monarch-Splitwise-Balance.csv', [
    'Date',
    'Balance',
    'Account',
  ] satisfies (keyof MonarchBalanceRow)[]);

  // open the modal
  return Boolean(
    (await clickElement('button', /^Edit[\s\W]*$/)) &&
      (await clickElement('div', /^Upload balance history$/)) &&
      // drop in the file
      (await uploadFilesToInput(newFile)) &&
      // hit go
      (await clickElement<HTMLButtonElement>('button', /^Add to account$/)) // &&
    // hit go
    // (await clickElement<HTMLButtonElement>('button', /^Confirm$/, 5000))
  );
};

const removeSimilarRows = (rowsA: TvbRow[], rowsB: TvbRow[]): TvbRow[] => {
  // sort both arrays
  // these are sorted a->z
  rowsA.sort(compareTvbRows);
  rowsB.sort(compareTvbRows);

  // declare holders for popped items
  // these will be z->a
  const uniqueA: TvbRow[] = [];
  const uniqueB: TvbRow[] = [];
  // holder for similar items
  const out: TvbRow[] = [];

  while (rowsA.length && rowsB.length) {
    const comparison = compareTvbRows(
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
      out.push(rowsA.pop() as TvbRow);
      rowsB.pop();
    }
  }

  // add unique back
  // flip the uniques because they are z->a
  rowsA.push(...uniqueA.reverse());
  rowsB.push(...uniqueB.reverse());

  return out.reverse();
};

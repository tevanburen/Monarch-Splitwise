import {
  clickElement,
  clickLink,
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
  wait,
} from '@/methods';
import {
  MonarchBalanceRow,
  MonarchRow,
  SplitwiseRow,
  TvbAccount,
  TvbAccountStatus,
  TvbBalanceRow,
  TvbRow,
} from '@/types';
import { fetchMonarchCsv } from '@/api';
import { removeSimilarRows, spliceElementsBS } from './algo';

export const driveAccount = async (
  account: TvbAccount,
  files: File[],
  authToken: string
): Promise<TvbAccountStatus> => {
  const response: TvbAccountStatus = {
    attempted: false,
    transactions: false,
    balances: false,
  };

  // find index of matching file
  const fileIndex = files.findIndex(
    (file) =>
      file.name.substring(0, account.splitwiseName.length).toLowerCase() ===
      account.splitwiseName.toLowerCase().replaceAll(' ', '-')
  );

  // return if no matching file
  if (fileIndex === -1) return response;

  // we are now making an attempt
  response.attempted = true;

  // get ready to add new charges
  const [oldRows, [newRows, balanceRows], onPage] = await Promise.all([
    // fetch old rows
    buildOldRows(account.monarchId, authToken),
    // read new row file
    buildNewRows(files[fileIndex]),
    // get to account page
    navigateToPage(account.monarchId),
  ]);
  // remove this file from the list
  files.splice(fileIndex, 1);

  // return if couldn't navigate to page
  if (!onPage) return response;

  // trim rows to startDate
  if (account.startDate) {
    spliceElementsBS<TvbRow, Date>(
      oldRows,
      (row) => row.date,
      new Date(account.startDate),
      (a, b) => a.getTime() - b.getTime()
    );
    spliceElementsBS<TvbRow, Date>(
      newRows,
      (row) => row.date,
      new Date(account.startDate),
      (a, b) => a.getTime() - b.getTime()
    );
  }

  // remove similar rows;
  removeSimilarRows(newRows, oldRows);

  // warn of floating old charges
  if (oldRows.length) {
    console.warn('The following rows are unmatched:', oldRows);
  }

  // upload new rows to monarch
  if (newRows.length) {
    response.transactions = await uploadRowsToMonarch(newRows);
  } else {
    response.transactions = true;
  }

  // return if fail during update
  if (!response.transactions) return response;

  // bridge the gap
  const [transactionsDone, balancesStarted] = await bridgeTransactionsBalance();
  if (!balancesStarted) {
    response.transactions = transactionsDone;
    return response;
  }

  // upload balance rows
  response.balances = await uploadBalanceRowsToMonarch(balanceRows);

  return response;
};

const buildOldRows = async (
  monarchId: string,
  authToken: string
): Promise<TvbRow[]> => {
  // fetch monarchText
  const monarchText = await fetchMonarchCsv(monarchId, authToken);

  // read monarch rows
  const oldRows = await ingestMonarchCsvText(monarchText);

  return oldRows.sort(compareTvbRows);
};

const buildNewRows = async (
  splitwiseFile: File
): Promise<[TvbRow[], TvbBalanceRow[]]> => {
  // read splitwise rows
  const newRows = await ingestSplitwiseCsvFile(
    splitwiseFile,
    'Thomas Van Buren'
  );

  return [newRows.sort(compareTvbRows), tvbRowsToTvbBalanceRows(newRows)];
};

const navigateToPage = async (monarchId: string): Promise<boolean> => {
  const target = `/accounts/details/${monarchId}`;
  const accountsTarget = '/accounts';
  return Boolean(
    window.location.pathname === target ||
      ((window.location.pathname === accountsTarget ||
        (await clickLink(accountsTarget))) &&
        (await clickLink(target)))
  );
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
    (row) =>
      (row.Description = (row.Description as number | string)
        .toString()
        .replace(/[^a-zA-Z0-9 ]+/g, ''))
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
      (await clickElement<HTMLButtonElement>('button', /^Add to account$/))
    // here we may need to resubmit but handled by the bridge function
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
    // here we can assume the edit modal is open due to the bridge function
    (await clickElement('div', /^Upload balance history$/)) &&
      // drop in the file
      (await uploadFilesToInput(newFile)) &&
      // hit go
      (await clickElement<HTMLButtonElement>('button', /^Add to account$/)) &&
      // sometimes it doesn't update today's balance, so go hit save
      (await wait(500)) &&
      (await clickElement('button', /^Edit[\s\W]*$/, 5000)) &&
      (await clickElement('div', /^Edit balance history$/)) &&
      (await wait(500)) &&
      (await clickElement('button', /^Save changes$/, 5000))
  );
};

// the difficulty is that sometimes Monarch wants to say "are you sure you want to submit this" and sometimes it doesn't
// so we need to try to click that button or start the next flow, either works
// allegedly
const bridgeTransactionsBalance = async (): Promise<[boolean, boolean]> => {
  const finishTransactions = async () =>
    await clickElement<HTMLButtonElement>('button', /^Confirm$/, 5000);
  const startBalances = async () =>
    await clickElement('button', /^Edit[\s\W]*$/);

  const finishTransactionsPromise = finishTransactions();
  const startBalancesPromise = startBalances();

  if (await startBalancesPromise) {
    // balance upload has been started, so
    return [true, true];
  } else if (await finishTransactionsPromise) {
    // transactions were finished, so give balance one more shot
    return [true, Boolean(await startBalances())];
  }

  return [false, false];
};

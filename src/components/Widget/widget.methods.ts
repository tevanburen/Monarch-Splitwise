import * as XLSX from 'xlsx';
import { MonarchRow, SplitwiseRow, TvbRow } from './widget.types';
import { inputId } from './widget.constants';

export const tmpDriver = async (file: File) => {
  // read splitwise rows
  const splitwiseArr = await csvToRows<SplitwiseRow>(file);

  // need to remove the "total balance" row
  splitwiseArr.pop();

  // transform splitwise to tvb
  let tvbArr = splitwiseToTvb(splitwiseArr, 'Thomas Van Buren');

  // filter out charges that don't involve me
  tvbArr = tvbArr.filter((row) => row.delta);

  // use most recent 3 for now
  tvbArr = tvbArr.slice(-3);

  // transform tvb to monarch
  const monarchArr = tvbToMonarch(tvbArr, 'The Upper');

  console.log(monarchArr);

  // write to a file
  const newFile = rowsToCsv(monarchArr, 'test.csv', [
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
  downloadFile(newFile);
  console.log('hi');
};

const csvToRows = async <R>(file: File): Promise<R[]> => {
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

const rowsToCsv = (
  rows: unknown[],
  fileName: string,
  columns?: string[]
): File => {
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: columns,
    skipHeader: false,
  });
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return new File([csv], fileName, {
    type: 'text/csv',
  });
};

const uploadFilesToInput = (files: File[]): void => {
  const inputs = Array.from(
    document.querySelectorAll('input[type="file"]')
  ) as HTMLInputElement[];
  const input = inputs.find((el) => el.id !== inputId);

  if (!input) {
    console.error('CSV file input not found.');
    return;
  }

  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

const downloadFile = (file: File): void => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');

  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up the object URL to avoid memory leaks
  URL.revokeObjectURL(url);
};

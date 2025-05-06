import * as XLSX from 'xlsx';
import { widgetInputId } from '@/components';

export const csvToRows = async <R>(file: File): Promise<R[]> => {
  const workbook = XLSX.read(await file.arrayBuffer(), { cellDates: true });

  const arr = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  ) as R[];

  return arr;
};

export const rowsToCsv = (
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

export const uploadFilesToInput = (files: File[]): void => {
  const inputs = Array.from(
    document.querySelectorAll('input[type="file"]')
  ) as HTMLInputElement[];
  const input = inputs.find((el) => el.id !== widgetInputId);

  if (!input) {
    console.error('CSV file input not found.');
    return;
  }

  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

export const downloadFile = (file: File): void => {
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

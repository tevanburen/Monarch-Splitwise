import * as XLSX from 'xlsx';

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

import { TvbRow } from '@/types';
import { compareTvbRows } from './conversion';

export const removeSimilarRows = (
  rowsA: TvbRow[],
  rowsB: TvbRow[]
): TvbRow[] => {
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

export const spliceElementsBS = <K, T>(
  rows: K[],
  getValue: (row: K) => T,
  target: T,
  compareValues: (a: T, b: T) => number
): void => {
  if (!rows.length) return;

  let left = 0;
  let right = rows.length - 1;

  while (left !== right) {
    const mid = Math.floor((left + right) / 2);
    if (compareValues(getValue(rows[mid]), target) < 0) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  rows.splice(
    0,
    compareValues(getValue(rows[left]), target) >= 0 ? left : rows.length
  );
};

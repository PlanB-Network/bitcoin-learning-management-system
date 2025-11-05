import type { RowList } from 'postgres';

export class EmptyResultError extends Error {
  constructor(message?: string) {
    super(message ?? 'Empty result');
  }
}

export const firstRow = <T>(rows: T[] | RowList<T[]>) =>
  rows.length > 0 ? rows[0] : null;

export const rejectOnEmpty = <T>(row: T | null): T => {
  if (!row) {
    throw new EmptyResultError();
  }

  return row;
};

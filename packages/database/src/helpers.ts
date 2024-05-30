import type { RowList } from 'postgres';
import postgres from 'postgres';

export const sql = postgres({});

export class EmptyResultError extends Error {
  constructor(message?: string) {
    super(message ?? 'Empty result');
  }
}

export const firstRow = <T>(rows: T[] | RowList<T[]>) =>
  rows.length > 0 ? rows[0] : undefined;

export const rejectOnEmpty = <T>(row: T | undefined): T => {
  if (!row) {
    throw new EmptyResultError();
  }

  return row;
};

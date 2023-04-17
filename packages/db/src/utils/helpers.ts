import type { RowList } from 'postgres';

export const firstRow = <T>(rows: T[] | RowList<T[]>) =>
  rows.length > 0 ? (rows[0] as T) : undefined;

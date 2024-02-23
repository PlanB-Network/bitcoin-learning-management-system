import type { RowList } from 'postgres';
import postgres from 'postgres';

export const sql = postgres({});

export const firstRow = <T>(rows: T[] | RowList<T[]>) =>
  rows.length > 0 ? rows[0] : undefined;

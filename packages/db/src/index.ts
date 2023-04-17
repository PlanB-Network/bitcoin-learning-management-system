import postgres from 'postgres';

export * from './client';
export * from './queries';
export * from './utils';

export const sql = postgres();

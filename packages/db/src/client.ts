import process from 'process';

import postgres from 'postgres';
import type { MaybeRow, PendingQuery, RowList, Sql } from 'postgres';

export interface PostgresClient extends Sql {
  /**
   * Execute a pending query
   *
   * @param query - Pending query
   * @returns Promise that resolves to the query result
   */
  exec: <R extends MaybeRow>(query: PendingQuery<R[]>) => Promise<RowList<R[]>>;
}

export const createPostgresClient = ({
  host,
  port,
  database,
  username,
  password,
}: {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
} = {}) => {
  const client = postgres({
    host: host || process.env['DB_HOST'],
    port: port || Number(process.env['DB_PORT']),
    database: database || process.env['DB_NAME'],
    username: username || process.env['DB_USER'],
    password: password || process.env['DB_PASSWORD'],
    onnotice: () => undefined,
  }) as PostgresClient;

  client.exec = <R extends MaybeRow>(query: PendingQuery<R[]>) => {
    return client<Array<Readonly<R>>>`${query}`;
  };

  return client;
};

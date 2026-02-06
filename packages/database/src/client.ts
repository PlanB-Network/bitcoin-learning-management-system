import type { PendingQuery, Row, Sql } from 'postgres';
import postgres from 'postgres';

import { firstRow, rejectOnEmpty } from './helpers.js';

export interface PostgresClientConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export type PostgresTypesMapper = {
  bigint: number;
  numeric: number;
  null: undefined; // Placeholder for TypeScript to accept undefined values
};

// Re-export the postgres package's TransactionSql with our type mapper.
// Note: postgres.TransactionSql extends Omit<Sql, ...> which doesn't preserve call signatures.
// We define our own interface that is structurally compatible with postgres.TransactionSql
// and explicitly includes the Sql call signatures for template tag and helper usage.
export interface TransactionSql
  extends Omit<
    Sql<PostgresTypesMapper>,
    | 'parameters'
    | 'largeObject'
    | 'subscribe'
    | 'CLOSE'
    | 'END'
    | 'PostgresError'
    | 'options'
    | 'reserve'
    | 'listen'
    | 'begin'
    | 'close'
    | 'end'
  > {
  // Template tag call signature
  <T extends readonly (object | undefined)[] = Row[]>(
    template: TemplateStringsArray,
    ...parameters: readonly unknown[]
  ): PendingQuery<T>;

  // Helper function call signature (for building SQL fragments)
  <T>(first: T, ...rest: unknown[]): unknown;
}

export type SqlHelper = Sql<PostgresTypesMapper>;

/**
 * Helper to cast postgres package's TransactionSql to our typed TransactionSql.
 * Use this when receiving a transaction from postgres.begin() callback.
 */
export const asTransaction = (tx: unknown): TransactionSql =>
  tx as TransactionSql;

// Set when createPostgresClient is called
export let sql: SqlHelper;

export interface PostgresClient extends SqlHelper {
  /**
   * Test if the client can connect to the database
   * and if the database is ready to accept queries
   *
   * @returns
   */
  connect: () => Promise<void>;

  /**
   * Disconnect from the database
   * @returns
   */
  disconnect: () => Promise<void>;

  /**
   * Dummy wrapper around query
   */
  exec: <T extends Row>(q: PendingQuery<T[]>) => Promise<T[]>;

  /**
   * Get the first row from the query result
   */
  getOne: <T extends Row>(q: PendingQuery<T[]>) => Promise<T | null>;

  /**
   * Get the first row from the query result or reject if the result is empty
   */
  getOneOrReject: <T extends Row>(q: PendingQuery<T[]>) => Promise<T>;
}

export const createPostgresClient = (
  config: PostgresClientConfig,
): PostgresClient => {
  let connected = false;

  sql = postgres({
    ...config,
    transform: {
      ...postgres.camel,
      // Convert undefined values to null postgres values
      undefined: null,
    },
    types: {
      bigint: {
        from: [20],
        parse: Number,
        serialize: (x: number) => x.toString(),
        to: 20,
      },
      // Placeholder for TypeScript to accept undefined values
      null: {
        from: [0],
        parse: () => undefined,
        serialize: () => null,
        to: 0,
      },
      numeric: {
        from: [1700],
        parse: Number,
        serialize: (x: number) => x.toString(),
        to: 1700,
      },
    },
  });

  return Object.assign(sql, {
    connect: async () => {
      if (connected) {
        return;
      }

      await sql`SELECT 1;`;
      console.debug(
        `[database] Connected ${config.host}:${config.port} on database ${config.database}`,
      );

      connected = true;
    },
    disconnect() {
      return sql.end();
    },
    exec<T extends Row>(query: PendingQuery<T[]>) {
      return query;
    },
    getOne<T extends Row>(query: PendingQuery<T[]>): Promise<T | null> {
      return this.exec(query).then(firstRow);
    },
    getOneOrReject<T extends Row>(query: PendingQuery<T[]>): Promise<T> {
      return this.exec(query).then(firstRow).then(rejectOnEmpty);
    },
  });
};

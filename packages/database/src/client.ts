import postgres from 'postgres';
import type {
  TransactionSql as OriginalTransactionSql,
  PendingQuery,
  Row,
  RowList,
  Sql,
} from 'postgres';

export interface PostgresClientConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type PostgresTypesMapper = {
  bigint: number;
  numeric: number;
  null: undefined; // Placeholder for TypeScript to accept undefined values
};

export type TransactionSql = OriginalTransactionSql<PostgresTypesMapper>;

export type SqlHelper = Sql<PostgresTypesMapper>;

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
  exec: <T extends Row[]>(q: PendingQuery<T>) => Promise<RowList<T>>;
}

export const createPostgresClient = (
  config: PostgresClientConfig,
): PostgresClient => {
  let connected = false;

  sql = postgres({
    ...config,
    types: {
      bigint: {
        to: 20,
        from: [20],
        parse: Number,
        serialize: (x: number) => x.toString(),
      },
      numeric: {
        to: 1700,
        from: [1700],
        parse: Number,
        serialize: (x: number) => x.toString(),
      },
      // Placeholder for TypeScript to accept undefined values
      null: {
        to: 0,
        from: [0],
        // eslint-disable-next-line unicorn/no-useless-undefined
        parse: () => undefined,
        serialize: () => null,
      },
    },
    transform: {
      // eslint-disable-next-line import/no-named-as-default-member
      ...postgres.camel,
      // Convert undefined values to null postgres values
      undefined: null,
    },
  });

  return Object.assign(sql, {
    connect: async () => {
      if (connected) {
        return;
      }

      await sql`SELECT 1;`;
      console.debug(
        `Connected ${config.host}:${config.port} on database ${config.database}`,
      );

      connected = true;
    },
    disconnect() {
      return sql.end();
    },
    exec<T extends Row[]>(query: PendingQuery<T>) {
      return query;
    },
  });
};

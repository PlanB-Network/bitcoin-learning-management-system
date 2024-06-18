import postgres from 'postgres';
import type { TransactionSql as OriginalTransactionSql, Sql } from 'postgres';

export interface PostgresClientConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface PostgresTypesMapper {
  bigint: number;
  numeric: number;
  timestamptz: number;
  // Placeholder for TypeScript to accept undefined values
  null: undefined;
}

export type TransactionSql = OriginalTransactionSql<PostgresTypesMapper>;

export interface PostgresClient extends Sql<PostgresTypesMapper> {
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
}

export const createPostgresClient = (config: PostgresClientConfig) => {
  let connected = false;

  const client = postgres({
    ...config,
    // onnotice: () => undefined,
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
      // timestamptz: {
      //   to: 1184,
      //   from: [1184],
      //   parse: (value: string | Date) => new Date(value).getTime(),
      //   serialize: (x: number | Date) => new Date(x).toISOString(),
      // },
      // Placeholder for TypeScript to accept undefined values
      null: {
        to: 0,
        from: [0],
        parse: () => {},
        serialize: () => null,
      },
    },
    transform: {
      // eslint-disable-next-line import/no-named-as-default-member
      ...postgres.camel,
      // Convert undefined values to null postgres values
      undefined: null,
    },
  }) as PostgresClient;

  client.connect = async () => {
    if (connected) {
      return;
    }

    await client`SELECT 1;`;
    console.debug(
      `Connected ${config.host}:${config.port} on database ${config.database}`,
    );
    connected = true;
  };

  client.disconnect = () => {
    return client.end();
  };

  return client;
};

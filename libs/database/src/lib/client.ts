import postgres from 'postgres';
import type {
  TransactionSql as OriginalTransactionSql,
  PostgresType,
  Sql,
} from 'postgres';

export type PostgresTypes = {
  bigint: PostgresType<number>;
  numeric: PostgresType<number>;
  timestamptz: PostgresType<number>;
  // Placeholder for TypeScript to accept undefined values
  null: PostgresType<undefined>;
};

export type PostgresTypesMapper = {
  bigint: number;
  numeric: number;
  timestamptz: number;
  // Placeholder for TypeScript to accept undefined values
  null: undefined;
};

const types = {
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
  timestamptz: {
    to: 1184,
    from: [1184],
    parse: (value: string | Date) => new Date(value).getTime(),
    serialize: (x: number | Date) => new Date(x).toISOString(),
  },
  // Placeholder for TypeScript to accept undefined values
  null: {
    to: 0,
    from: [0],
    parse: () => undefined,
    serialize: () => null,
  },
} as PostgresTypes;

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
  let connected = false;

  const client = postgres({
    host: host || process.env['DB_HOST'],
    port: port || Number(process.env['DB_PORT']),
    database: database || process.env['DB_NAME'],
    username: username || process.env['DB_USER'],
    password: password || process.env['DB_PASSWORD'],
    // onnotice: () => undefined,
    types,
    transform: {
      // Convert undefined values to null postgres values
      undefined: null,
      // Convert null postgres values to undefined
      value: (value) => value ?? undefined,
    },
  }) as PostgresClient;

  client.connect = async () => {
    if (connected) {
      return;
    }

    await client`SELECT 1;`;
    console.debug(`Connected ${host}:${port} on database ${database}`);
    connected = true;
  };

  client.disconnect = () => {
    return client.end();
  };

  return client;
};

import postgres from 'postgres';
import type { MaybeRow, PendingQuery, RowList, Sql } from 'postgres';

export interface PostgresClient extends Sql {
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
  let connected = false;

  const client = postgres({
    host: host || process.env['DB_HOST'],
    port: port || Number(process.env['DB_PORT']),
    database: database || process.env['DB_NAME'],
    username: username || process.env['DB_USER'],
    password: password || process.env['DB_PASSWORD'],
    // onnotice: () => undefined,
  }) as PostgresClient;

  client.exec = <R extends MaybeRow>(query: PendingQuery<R[]>) => {
    return client<Array<Readonly<R>>>`${query}`;
  };

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

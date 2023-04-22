import type { PostgresClient } from '@sovereign-academy/database';
import { createPostgresClient } from '@sovereign-academy/database';

const postgres = createPostgresClient({
  host: process.env['DB_HOST'],
  port: Number(process.env['DB_PORT']),
  database: process.env['DB_NAME'],
  username: process.env['DB_USER'],
  password: process.env['DB_PASSWORD'],
});

export interface Dependencies {
  postgres: PostgresClient;
}

export const startDependencies = async () => {
  await postgres.connect();

  return {
    postgres,
  } as Dependencies;
};

export const stopDependencies = async () => {
  await postgres.disconnect();
};

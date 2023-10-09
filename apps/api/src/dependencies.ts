import type { PostgresClient } from '@sovereign-university/database';
import { createPostgresClient } from '@sovereign-university/database';

const postgres = createPostgresClient({
  host: process.env['POSTGRES_HOST'],
  port: Number(process.env['POSTGRES_PORT']),
  database: process.env['POSTGRES_NAME'],
  username: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
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

import { Redis } from 'ioredis';

import type { PostgresClient } from '@sovereign-university/database';
import { createPostgresClient } from '@sovereign-university/database';

export interface Dependencies {
  redis: Redis;
  postgres: PostgresClient;
}

export const startDependencies = async () => {
  const postgres = createPostgresClient({
    host: process.env['POSTGRES_HOST'],
    port: Number(process.env['POSTGRES_PORT']),
    database: process.env['POSTGRES_NAME'],
    username: process.env['POSTGRES_USER'],
    password: process.env['POSTGRES_PASSWORD'],
  });

  const redis = new Redis({
    host: process.env['REDIS_HOST'],
    port: Number(process.env['REDIS_PORT']),
    password: process.env['REDIS_PASSWORD'],
  });

  await postgres.connect();

  const dependencies = {
    redis,
    postgres,
  } as Dependencies;

  const stopDependencies = async () => {
    await postgres.disconnect();
  };

  return {
    dependencies,
    stopDependencies,
  };
};

import { EventEmitter } from 'eventemitter3';

import { createPostgresClient } from '@sovereign-university/database';
import type { PostgresClient } from '@sovereign-university/database';
import { RedisClient } from '@sovereign-university/redis';
import type { ApiEvents } from '@sovereign-university/types';

export interface Dependencies {
  redis: RedisClient;
  postgres: PostgresClient;
  events: EventEmitter<ApiEvents>;
}

export const startDependencies = async () => {
  const postgres = createPostgresClient({
    host: process.env['POSTGRES_HOST'],
    port: Number(process.env['POSTGRES_PORT']),
    database: process.env['POSTGRES_NAME'],
    username: process.env['POSTGRES_USER'],
    password: process.env['POSTGRES_PASSWORD'],
  });

  const redis = new RedisClient({
    host: process.env['REDIS_HOST'],
    port: Number(process.env['REDIS_PORT']),
    password: process.env['REDIS_PASSWORD'],
  });

  const events = new EventEmitter<ApiEvents>();

  await postgres.connect();

  const dependencies = {
    redis,
    postgres,
    events,
  } as Dependencies;

  const stopDependencies = async () => {
    await postgres.disconnect();
  };

  return {
    dependencies,
    stopDependencies,
  };
};

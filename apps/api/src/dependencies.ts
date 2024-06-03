import { EventEmitter } from 'eventemitter3';

import { createPostgresClient } from '@sovereign-university/database';
import type { PostgresClient } from '@sovereign-university/database';
import { RedisClient } from '@sovereign-university/redis';
import type { ApiEvents, EnvConfig } from '@sovereign-university/types';

import * as config from './config.js';

export interface Dependencies {
  redis: RedisClient;
  postgres: PostgresClient;
  events: EventEmitter<ApiEvents>;
  config: EnvConfig;
}

export const startDependencies = async () => {
  const postgres = createPostgresClient({
    host: process.env['POSTGRES_HOST'],
    port: Number(process.env['POSTGRES_PORT']),
    database: process.env['POSTGRES_DB'],
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

  const dependencies: Dependencies = {
    redis,
    postgres,
    events,
    config,
  };

  const stopDependencies = async () => {
    await postgres.disconnect();
  };

  return {
    dependencies,
    stopDependencies,
  };
};

import { EventEmitter } from 'eventemitter3';

import { createPostgresClient } from '@blms/database';
import type { PostgresClient } from '@blms/database';
import { RedisClient } from '@blms/redis';
import type { ApiEvents, EnvConfig } from '@blms/types';

import * as config from './config.js';

export interface Dependencies {
  redis: RedisClient;
  postgres: PostgresClient;
  events: EventEmitter<ApiEvents>;
  config: EnvConfig;
}

export const startDependencies = async () => {
  const postgres = createPostgresClient(config.postgres);

  const redis = new RedisClient(config.redis);

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

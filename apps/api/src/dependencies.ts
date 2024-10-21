import { EventEmitter } from 'eventemitter3';

import { type CronService, createCronService } from '@blms/crons';
import { createPostgresClient } from '@blms/database';
import type { PostgresClient } from '@blms/database';
import { RedisClient } from '@blms/redis';
import { type S3Service, createS3Service } from '@blms/s3';
import type { ApiEvents, EnvConfig } from '@blms/types';

import * as config from './config.js';
import { registerCronTasks } from './services/cron/index.js';

export interface Dependencies {
  s3: S3Service;
  redis: RedisClient;
  postgres: PostgresClient;
  events: EventEmitter<ApiEvents>;
  config: EnvConfig;
  crons: CronService;
}

export const startDependencies = async () => {
  const crons = createCronService();
  const postgres = createPostgresClient(config.postgres);
  const s3 = createS3Service(config.s3);
  const redis = new RedisClient(config.redis);
  const events = new EventEmitter<ApiEvents>();
  await postgres.connect();

  const dependencies: Dependencies = {
    s3,
    redis,
    postgres,
    events,
    config,
    crons,
  };

  await registerCronTasks(dependencies);

  crons.start();

  const stopDependencies = async () => {
    await postgres.disconnect();
  };

  return {
    dependencies,
    stopDependencies,
  };
};

import Stripe from 'stripe';
import { Client as TypesenseClient } from 'typesense';

import { type CronService, createCronService } from '@blms/crons';
import { createPostgresClient } from '@blms/database';
import type { PostgresClient } from '@blms/database';
import { type S3Service, createS3Service } from '@blms/s3';
import type { EnvConfig, LogContext } from '@blms/types';

import * as config from './config.js';
import { registerCronTasks } from './services/cron/index.js';

export interface Dependencies {
  s3: S3Service;
  postgres: PostgresClient;
  typesense: TypesenseClient;
  config: EnvConfig;
  crons: CronService;
  stripe: Stripe;
}

export const injectLogContext = <T>(
  deps: T,
  ctx: LogContext,
): T & LogContext => {
  return {
    ...deps,
    ...ctx,
  };
};

export const startDependencies = async () => {
  const crons = createCronService();
  const postgres = createPostgresClient(config.postgres);
  const s3 = createS3Service(config.s3);
  const stripe = new Stripe(config.stripe.secret);
  await postgres.connect();

  const typesense = new TypesenseClient({
    nodes: config.typesense.nodes,
    apiKey: config.typesense.apiKey,
    connectionTimeoutSeconds: 2,
  });

  const dependencies: Dependencies = {
    s3,
    postgres,
    typesense,
    config,
    crons,
    stripe,
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

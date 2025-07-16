import { type CronService, createCronService } from '@blms/crons';
import { createPostgresClient } from '@blms/database';
import type { PostgresClient } from '@blms/database';
import { type S3Service, createS3Service } from '@blms/s3';
import {
  type LanguageToolkitClient,
  createLanguageToolkitClient,
} from '@blms/service-language-toolkit';
import type { EnvConfig, LogContext } from '@blms/types';
import Stripe from 'stripe';
import { Client as TypesenseClient } from 'typesense';

import * as config from './config.js';
import { registerCronTasks } from './services/cron/index.js';

export interface Dependencies {
  s3: S3Service;
  postgres: PostgresClient;
  typesense: TypesenseClient;
  config: EnvConfig;
  crons: CronService;
  stripe: Stripe;
  languageToolkit: LanguageToolkitClient;
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
  const languageToolkit = createLanguageToolkitClient({
    baseUrl: process.env.LT_BASE_URL ?? '',
    clientId: process.env.LT_CLIENT_ID ?? '',
    clientSecret: process.env.LT_CLIENT_SECRET ?? '',
  });
  await postgres.connect();

  const typesense = new TypesenseClient({
    apiKey: config.typesense.apiKey,
    connectionTimeoutSeconds: 2,
    nodes: config.typesense.nodes,
  });

  const dependencies: Dependencies = {
    config,
    crons,
    postgres,
    s3,
    stripe,
    typesense,
    languageToolkit,
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

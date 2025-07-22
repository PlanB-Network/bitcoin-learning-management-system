import type { PostgresClient } from '@blms/database';
import type { S3Service } from '@blms/s3';
import type { EnvConfig, LogContext } from '@blms/types';
import type Stripe from 'stripe';

export interface Dependencies extends LogContext {
  postgres: PostgresClient;
  config: EnvConfig;
  s3: S3Service;
  stripe: Stripe | null;
}

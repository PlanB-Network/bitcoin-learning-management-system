import type Stripe from 'stripe';

import type { PostgresClient } from '@blms/database';
import type { S3Service } from '@blms/s3';
import type { EnvConfig } from '@blms/types';
import type { LogContext } from '@blms/types';

export interface Dependencies extends LogContext {
  postgres: PostgresClient;
  config: EnvConfig;
  s3: S3Service;
  stripe: Stripe;
}

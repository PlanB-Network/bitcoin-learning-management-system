import type { PostgresClient } from '@sovereign-university/database';
import type { EnvConfig } from '@sovereign-university/types';

export interface Dependencies {
  postgres: PostgresClient;
  config: EnvConfig;
}

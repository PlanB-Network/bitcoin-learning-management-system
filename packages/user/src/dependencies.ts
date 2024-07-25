import type { PostgresClient } from '@blms/database';
import type { EnvConfig } from '@blms/types';

export interface Dependencies {
  postgres: PostgresClient;
  config: EnvConfig;
}

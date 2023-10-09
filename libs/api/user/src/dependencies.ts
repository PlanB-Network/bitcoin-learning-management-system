import type { PostgresClient } from '@sovereign-university/database';

export interface Dependencies {
  postgres: PostgresClient;
}

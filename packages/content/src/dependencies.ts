import type { PostgresClient } from '@sovereign-academy/database';

export interface Dependencies {
  postgres: PostgresClient;
}

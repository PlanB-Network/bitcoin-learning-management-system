import type { PostgresClient } from '@blms/database';

export interface Dependencies {
  postgres: PostgresClient;
}

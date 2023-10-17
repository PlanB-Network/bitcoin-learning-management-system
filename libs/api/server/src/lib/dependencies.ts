import type { EventEmitter } from 'eventemitter3';

import type { PostgresClient } from '@sovereign-university/database';
import type { RedisClient } from '@sovereign-university/redis';
import type { ApiEvents } from '@sovereign-university/types';

export interface Dependencies {
  postgres: PostgresClient;
  redis: RedisClient;
  events: EventEmitter<ApiEvents>;
}

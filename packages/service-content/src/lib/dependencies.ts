import type { PostgresClient } from '@blms/database';
import type { S3Service } from '@blms/s3';
import type { LogContext } from '@blms/types';
import type { Client as TypesenseClient } from 'typesense';

export interface Dependencies extends LogContext {
  typesense: TypesenseClient;
  postgres: PostgresClient;
  s3: S3Service;
}

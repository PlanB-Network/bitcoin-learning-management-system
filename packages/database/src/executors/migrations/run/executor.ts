import path from 'path';

import type { ExecutorContext } from '@nx/devkit';
import * as dotenv from 'dotenv';

import { PostgresClient, createPostgresClient } from '../../../client';
import { runMigrations } from '../../../utils/migrations';

import { MigrationRunExecutorSchema } from './schema';

dotenv.config();

export default async function runExecutor(
  options: MigrationRunExecutorSchema,
  context: ExecutorContext
) {
  const migrationPath = path.join(
    context.root,
    options.dir,
    options.file || ''
  );

  if (options.file) {
    console.log(`🚀 Running migration: ${options.file}`);
  } else {
    console.log(`🚀 Running migrations from ${options.dir}`);
  }

  if (options.drop) {
    let tmpClient: PostgresClient;

    try {
      tmpClient = createPostgresClient({
        database: 'tmp',
      });
      await tmpClient.connect();
    } catch (error) {
      const client = createPostgresClient({
        database: options.database,
      });

      await client.connect();
      await client`CREATE DATABASE tmp`;
      client.disconnect();

      tmpClient = createPostgresClient({
        database: 'tmp',
      });
    }

    const database = options.database || process.env['DB_NAME'] || 'postgres';
    const databaseSql = tmpClient(database);

    await tmpClient`SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = ${database} AND pid <> pg_backend_pid();`;
    await tmpClient`DROP DATABASE IF EXISTS ${databaseSql};`;
    await tmpClient`CREATE DATABASE ${databaseSql};`;
    tmpClient.disconnect();
  }

  const client = createPostgresClient({
    database: options.database,
  });

  await runMigrations(client, migrationPath);

  return {
    success: true,
  };
}

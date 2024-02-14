import fs from 'node:fs/promises';
import path from 'node:path';

import * as dotenv from 'dotenv';

import type { PostgresClient } from '../client.js';
import { createPostgresClient } from '../client.js';
import { runMigrations } from '../migrations.js';

dotenv.config();

// TODO: Redo this

export const addMigrationCommand = async ({
  name,
  migrationsPath,
}: {
  name: string;
  migrationsPath: string;
}) => {
  // Serialize the date to a string in the format YYYYMMDDHHMMSS
  const now = new Date();
  const dateStr = [
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
  ]
    .map((i) => i.toString().padStart(2, '0'))
    .join('');

  // Compute the migration file name and path
  const fileName = `${dateStr}-${name}.sql`;
  const migrationFile = path.join(migrationsPath, fileName);

  // Write the migration file and create the directory if it doesn't exist
  await fs.mkdir(path.dirname(migrationFile), { recursive: true });
  await fs.writeFile(migrationFile, `-- Path: ${migrationsPath}/${fileName}`);

  console.log(`✅ Created migration file: ${fileName}`);

  return {
    success: true,
  };
};

export const runMigrationsCommand = async ({
  migrationsPath,
  database,
  file,
  drop,
}: {
  migrationsPath: string;
  database?: string;
  file?: string;
  drop?: boolean;
}) => {
  const migrationPath = path.join(migrationsPath, file || '');

  if (file) {
    console.log(`🚀 Running migration: ${file}`);
  } else {
    console.log(`🚀 Running migrations from ${migrationPath}`);
  }

  if (drop) {
    let tmpClient: PostgresClient;

    try {
      tmpClient = createPostgresClient({
        database: 'tmp',
      });
      await tmpClient.connect();
    } catch {
      const client = createPostgresClient({
        database: database,
      });

      await client.connect();
      await client`CREATE DATABASE tmp`;
      await client.disconnect();

      tmpClient = createPostgresClient({
        database: 'tmp',
      });
    }

    const databaseName = database || process.env['POSTGRES_NAME'] || 'postgres';
    const databaseSql = tmpClient(databaseName);

    await tmpClient`SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = ${databaseName} AND pid <> pg_backend_pid();`;
    await tmpClient`DROP DATABASE IF EXISTS ${databaseSql};`;
    await tmpClient`CREATE DATABASE ${databaseSql};`;
    await tmpClient.disconnect();
  }

  const client = createPostgresClient({
    database,
  });

  await runMigrations(client, migrationPath);

  return {
    success: true,
  };
};

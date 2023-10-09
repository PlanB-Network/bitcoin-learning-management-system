import fs from 'fs/promises';
import path from 'path';

import type { PostgresClient } from './client';

const createMigrationsTable = (client: PostgresClient) => {
  return client`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT NOT NULL PRIMARY KEY,
      run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
};

const getExistingMigrations = async (client: PostgresClient) => {
  const migrations = await client`
    SELECT * FROM migrations
  `;

  return migrations.map((m) => m['name']);
};

export const runMigrations = async (
  client: PostgresClient,
  fileOrFolder: string,
) => {
  const migrationPath = path.resolve(fileOrFolder);
  const migrations = [];

  // Check if directory or file
  const stats = await fs.stat(migrationPath);
  if (stats.isDirectory()) {
    // Run all migrations in directory
    const files = await fs.readdir(migrationPath);
    migrations.push(
      ...files.map((f) => ({ name: f, path: path.join(migrationPath, f) })),
    );
  } else if (stats.isFile()) {
    // Run a single migration
    migrations.push({
      name: path.basename(migrationPath),
      path: migrationPath,
    });
  } else {
    throw new Error('Invalid migration path');
  }

  await createMigrationsTable(client);
  const existingMigrations = await getExistingMigrations(client);
  const migrationsToRun = migrations.filter(
    (m) => !existingMigrations.includes(m.name),
  );

  if (migrationsToRun.length === 0) {
    console.log(
      '👍 No migrations to run (all migrations have already been executed)',
    );
    return;
  }

  for (const index in migrationsToRun) {
    const migration = migrationsToRun[index];

    console.log(
      `🔄 Running migration ${Number(index) + 1} out of ${
        migrationsToRun.length
      }: ${migration.name}`,
    );

    try {
      await client.file(migration.path);
    } catch (error) {
      console.error(`   ❌ Failed, aborting`);
      console.error(error);
      process.exit(1);
    }

    await client`
      INSERT INTO migrations ${client(migration, 'name')}
    `;

    console.log(`   ✅ Completed`);
  }

  console.log(`👍 Completed all migrations`);
};

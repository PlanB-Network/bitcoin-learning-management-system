import path from 'path';

import type { ExecutorContext } from '@nrwl/devkit';
import dotenv from 'dotenv';

import { createPostgresClient } from '../../../client';
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

  const client = createPostgresClient();

  await runMigrations(client, migrationPath);

  return {
    success: true,
  };
}

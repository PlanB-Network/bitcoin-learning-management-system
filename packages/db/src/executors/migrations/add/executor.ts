import fs from 'fs/promises';
import path from 'path';

import type { ExecutorContext } from '@nrwl/devkit';

import { MigrationAddExecutorSchema } from './schema';

export default async function runExecutor(
  options: MigrationAddExecutorSchema,
  context: ExecutorContext
) {
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
  const fileName = `${dateStr}-${options.name}.sql`;
  const migrationFile = path.join(context.root, options.dir, fileName);

  // Write the migration file and create the directory if it doesn't exist
  await fs.mkdir(path.dirname(migrationFile), { recursive: true });
  await fs.writeFile(migrationFile, `-- Path: ${options.dir}/${fileName}`);

  console.log(`✅ Created migration file: ${fileName}`);

  return {
    success: true,
  };
}

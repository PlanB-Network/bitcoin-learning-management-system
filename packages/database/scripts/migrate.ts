import { parseArgs } from 'node:util';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const {
  values: { database: databaseName },
} = parseArgs({
  options: {
    database: {
      type: 'string',
    },
  },
});

const sql = postgres({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: databaseName ?? (process.env.POSTGRES_DB || 'postgres'),
  max: 1,
  onnotice: (notice) => console.log(`Postgres NOTICE: ${notice.message}`),
});

const database = drizzle(sql);

console.log('Running migrations ...');

await migrate(database, { migrationsFolder: 'drizzle/migrations' });

await sql.end();

console.log('Migrations completed !');

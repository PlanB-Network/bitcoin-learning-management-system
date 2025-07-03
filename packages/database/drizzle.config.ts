import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  casing: 'snake_case',
  dbCredentials: {
    database: process.env.POSTGRES_DB || 'postgres',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    ssl:
      process.env.NODE_ENV === 'production' ||
      process.env.NODE_ENV === 'testnet'
        ? 'prefer'
        : false,
    user: process.env.POSTGRES_USER || 'postgres',
  },
  dialect: 'postgresql',
  introspect: {
    casing: 'camel',
  },
  out: './drizzle/migrations',
  schema: './drizzle/schema.ts',
  schemaFilter: ['users', 'content'],
});

import type { PostgresClientConfig } from '@sovereign-university/database';
import type { RedisClientConfig } from '@sovereign-university/redis';
import type { EnvConfig } from '@sovereign-university/types';

const getenv = <T extends string | number | boolean | null = string>(
  name: string,
  fallback?: T,
): T => {
  const value = process.env[name] ?? '';

  // If the value is empty and no fallback is provided, throw an error
  if (!value && fallback === undefined) {
    throw new Error(`Missing mandatory value for "${name}"`);
  }

  // If the value is empty and a fallback is provided, log a warning
  if (!value && fallback !== null) {
    console.warn(
      `No value found for ${name}, defaulting to ${JSON.stringify(fallback)}`,
    );
  }

  // If the value is not empty, parse it to the correct type (inferred from fallback type)
  if (fallback !== null) {
    switch (typeof fallback) {
      case 'boolean': {
        return (value ? value === 'true' : fallback) as T;
      }
      case 'number': {
        return (Number.parseInt(value) || fallback) as T;
      }
    }
  }

  return (value || fallback) as T;
};

/**
 * Real application domain (without trailing slash)
 */
export const domainUrl = getenv<string>('DOMAIN_URL', 'http://localhost:8181');

export const sendgrid: EnvConfig['sendgrid'] = {
  key: getenv<string | null>('SENDGRID_KEY', null),
  enable: getenv<boolean>('SENDGRID_ENABLE', false),
  email: getenv<string | null>('SENDGRID_EMAIL', null),
  templates: {
    emailChange: getenv<string | null>(
      'SENDGRID_EMAIL_CHANGE_TEMPLATE_ID',
      null,
    ),
    recoverPassword: getenv<string | null>(
      'SENDGRID_RECOVER_PASSWORD_TEMPLATE_ID',
      null,
    ),
  },
};

export const postgres: PostgresClientConfig = {
  host: getenv<string>('POSTGRES_HOST', 'localhost'),
  port: getenv<number>('POSTGRES_PORT', 5432),
  database: getenv<string>('POSTGRES_DB'),
  username: getenv<string>('POSTGRES_USER'),
  password: getenv<string>('POSTGRES_PASSWORD'),
};

export const redis: RedisClientConfig = {
  host: getenv<string>('REDIS_HOST', 'localhost'),
  port: getenv<number>('REDIS_PORT', 6379),
  database: getenv<number>('REDIS_DB', 0),
  password: process.env['REDIS_PASSWORD'],
  username: process.env['REDIS_USERNAME'],
};

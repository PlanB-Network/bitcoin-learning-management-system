import fs from 'node:fs';
import process from 'node:process';

import type { PostgresClientConfig } from '@blms/database';
import type {
  GitHubSyncConfig,
  OpenTimestampsConfig,
  S3Config,
  SendGridConfig,
  SessionConfig,
  StripeConfig,
  SwissBitcoinPayConfig,
  TypesenseConfig,
} from '@blms/types';

// Set environment variables directly if not set
if (!process.env.NODE_ENV) {
  console.log('Setting NODE_ENV to development');
  process.env.NODE_ENV = 'development';
}

// Set PostgreSQL environment variables directly if not set
if (!process.env.POSTGRES_DB) {
  console.log('Setting PostgreSQL environment variables directly');
  process.env.POSTGRES_HOST = 'localhost';
  process.env.POSTGRES_PORT = '5432';
  process.env.POSTGRES_DB = 'postgres';
  process.env.POSTGRES_USER = 'postgres';
  process.env.POSTGRES_PASSWORD = 'postgres';
}

// Set other required variables
if (!process.env.DATA_REPOSITORY_URL) {
  process.env.DATA_REPOSITORY_URL =
    'https://github.com/PlanB-Network/bitcoin-educational-content.git';
}

if (!process.env.S3_ENDPOINT) {
  process.env.S3_ENDPOINT = 'http://localhost:9000';
  process.env.S3_REGION = 'us-east-1';
  process.env.S3_BUCKET = 'blms';
  process.env.S3_ACCESS_KEY = 'minioadmin';
  process.env.S3_SECRET_KEY = 'minioadmin';
}

// Set Stripe secret
if (!process.env.STRIPE_SECRET) {
  process.env.STRIPE_SECRET = 'sk_test_mock_key';
  process.env.VITE_STRIPE_PUBLIC = 'pk_test_mock_key';
}

function getenv<
  T,
  R = T extends unknown ? string : T extends null ? string | null : T,
>(name: string, fallback?: T): R {
  const value = process.env[name] ?? '';

  console.log(`Getting env var ${name}: ${value || '(empty)'}`);

  // If the value is empty and no fallback is provided, throw an error
  if (!value && fallback === undefined) {
    throw new Error(`Missing mandatory value for "${name}"`);
  }

  // If the value is empty and a fallback is provided, log a warning
  if (!value) {
    console.warn(
      `[config] No value found for ${name}, defaulting to ${JSON.stringify(fallback)}`,
    );
  }

  // If the value is not empty, parse it to the correct type (inferred from fallback type)
  if (fallback !== null) {
    switch (typeof fallback) {
      case 'boolean': {
        return (value ? value === 'true' : fallback) as R;
      }
      case 'number': {
        return (Number.parseInt(value) || fallback) as R;
      }
    }
  }

  return (value || fallback) as R;
}

export const production = getenv('NODE_ENV') === 'production';

/**
 * Application domain (without protocol)
 */
export const domain = getenv('DOMAIN', 'localhost:8181');

export const docker: boolean = getenv('DOCKER', false);

export const protectSyncRoute: boolean = getenv('PROTECT_SYNC_ROUTE', true);

/**
 * Real application domain (without trailing slash)
 */
export const domainUrl = getenv('DOMAIN_URL', 'http://localhost:8181');

export const sendgrid: SendGridConfig = {
  email: getenv('SENDGRID_EMAIL', null),
  enable: getenv('SENDGRID_ENABLE', false),
  key: getenv('SENDGRID_KEY', null),
  templates: {
    emailChange: getenv('SENDGRID_EMAIL_CHANGE_TEMPLATE_ID', null),
    resetPassword: getenv('SENDGRID_RESET_PASSWORD_TEMPLATE_ID', null),
  },
};

export const postgres: PostgresClientConfig = {
  database: getenv('POSTGRES_DB'),
  host: getenv('POSTGRES_HOST', 'localhost'),
  password: getenv('POSTGRES_PASSWORD'),
  port: getenv('POSTGRES_PORT', 5432),
  username: getenv('POSTGRES_USER'),
};

export const sync: GitHubSyncConfig = {
  cdnPath: getenv('CDN_PATH', '/tmp/cdn'),
  syncPath: getenv('SYNC_PATH', '/tmp/sync'),
  publicRepositoryUrl: getenv('DATA_REPOSITORY_URL'),
  publicRepositoryBranch: getenv('DATA_REPOSITORY_BRANCH', 'dev'),
  privateRepositoryUrl: getenv('PRIVATE_DATA_REPOSITORY_URL', null),
  privateRepositoryBranch: getenv('PRIVATE_DATA_REPOSITORY_BRANCH', 'main'),
  githubAccessToken: getenv('GITHUB_ACCESS_TOKEN', null),
};

export const session: SessionConfig = {
  cookieName: getenv('SESSION_COOKIE_NAME', 'session'),
  domain: production ? domain : undefined,
  maxAge: getenv('SESSION_MAX_AGE', 1000 * 60 * 60 * 24 * 7), // 1 week
  secret: getenv('SESSION_SECRET', 'super secret'),
  secure: production,
};

export const stripe: StripeConfig = {
  endpointSecret: getenv('STRIPE_ENDPOINT_SECRET', null),
  publicKey: getenv('VITE_STRIPE_PUBLIC', null),
  secret: getenv('STRIPE_SECRET', ''),
};

export const swissBitcoinPay: SwissBitcoinPayConfig = {
  apiKey: getenv('SBP_API_KEY', null),
  proxyUrl: getenv('PUBLIC_PROXY_URL', null),
};

const rpcUrl = getenv('OTS_RPC_URL', null);
const rpcUser = getenv('OTS_RPC_USER', null);
const rpcPassword = getenv('OTS_RPC_PASSWORD', null);
const pgpKeyPath = docker ? '/tmp/key.asc' : getenv('OTS_PGP_KEY_PATH', null);
export const opentimestamps: OpenTimestampsConfig = {
  armoredKey: pgpKeyPath && fs.readFileSync(pgpKeyPath, 'utf8'),
  passphrase: getenv('OTS_PGP_KEY_PASSPHRASE', null),
  rpc:
    rpcUrl && rpcUser
      ? { password: rpcPassword, url: rpcUrl, user: rpcUser }
      : undefined,
};

export const s3: S3Config = {
  accessKey: getenv('S3_ACCESS_KEY').trim(),
  bucket: getenv('S3_BUCKET').trim(),
  endpoint: getenv('S3_ENDPOINT').trim(),
  region: getenv('S3_REGION').trim(),
  secretKey: getenv('S3_SECRET_KEY').trim(),
};

export const typesense: TypesenseConfig = {
  apiKey: getenv('TYPESENSE_API_KEY', 'xyz'),
  nodes: getenv('TYPESENSE_NODES', 'http://typesense:8108')
    .split(',')
    .map((url) => ({ url })),
};

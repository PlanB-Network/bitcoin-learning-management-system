/// <reference types="mocha" />

import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const configUrl = new URL('./config.ts', import.meta.url).href;
const apiDir = fileURLToPath(new URL('..', import.meta.url));

// Every value config.ts requires, without SESSION_SECRET
const requiredEnv = {
  DATA_REPOSITORY_URL: 'https://example.invalid/data.git',
  POSTGRES_DB: 'test',
  POSTGRES_PASSWORD: 'test',
  POSTGRES_USER: 'test',
  S3_ACCESS_KEY: 'test',
  S3_BUCKET: 'test',
  S3_ENDPOINT: 'https://s3.example.invalid',
  S3_REGION: 'test',
  S3_SECRET_KEY: 'test',
};

// Load config.ts in a fresh process, as the API does when it starts
const loadConfig = (env: Record<string, string>) =>
  spawnSync(
    process.execPath,
    [
      '--conditions=development',
      '--import',
      'tsx',
      '--input-type=module',
      '--eval',
      `await import(${JSON.stringify(configUrl)});`,
    ],
    {
      cwd: apiDir,
      encoding: 'utf8',
      env: { PATH: process.env.PATH ?? '', ...requiredEnv, ...env },
      timeout: 60_000,
    },
  );

describe('configuration', function () {
  // Each case starts a Node process that compiles config.ts
  this.timeout(60_000);

  it('refuses to start in production without SESSION_SECRET', () => {
    const result = loadConfig({ NODE_ENV: 'production' });

    assert.notEqual(result.status, 0, 'the API started without a secret');
    assert.match(result.stderr, /SESSION_SECRET/);
  });

  it('starts in production with SESSION_SECRET, and in development without it', () => {
    const environments: Record<string, string>[] = [
      { NODE_ENV: 'production', SESSION_SECRET: 'a-real-secret' },
      { NODE_ENV: 'development' },
    ];
    for (const env of environments) {
      const result = loadConfig(env);
      assert.equal(result.status, 0, result.stderr);
    }
  });
});

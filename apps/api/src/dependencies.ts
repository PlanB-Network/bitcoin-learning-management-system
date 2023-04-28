import type { PostgresClient } from '@sovereign-academy/database';
import { createPostgresClient } from '@sovereign-academy/database';
import type { GithubOctokit } from '@sovereign-academy/github';
import { createGithubOctokit } from '@sovereign-academy/github';

const postgres = createPostgresClient({
  host: process.env['DB_HOST'],
  port: Number(process.env['DB_PORT']),
  database: process.env['DB_NAME'],
  username: process.env['DB_USER'],
  password: process.env['DB_PASSWORD'],
});

export interface Dependencies {
  postgres: PostgresClient;
  octokit: GithubOctokit;
}

export const startDependencies = async () => {
  const octokit = await createGithubOctokit({
    appId: Number(process.env['GITHUB_APP_ID']),
    privateKey: process.env['GITHUB_APP_PRIVATE_KEY'],
    installationId: Number(process.env['GITHUB_APP_INSTALLATION_ID']),
  });

  await postgres.connect();

  return {
    postgres,
    octokit,
  } as Dependencies;
};

export const stopDependencies = async () => {
  await postgres.disconnect();
};

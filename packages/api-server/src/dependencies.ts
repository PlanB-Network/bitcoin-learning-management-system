import type { PostgresClient } from '@sovereign-academy/database';
import type { GithubOctokit } from '@sovereign-academy/github';

export interface Dependencies {
  postgres: PostgresClient;
  octokit: GithubOctokit;
}

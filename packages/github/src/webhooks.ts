import { Webhooks, createNodeMiddleware } from '@octokit/webhooks';
import type { Commit } from '@octokit/webhooks-types';
import * as async from 'async';

import { processChangedFiles } from '@sovereign-academy/content';
import type { ChangeKind, ChangedFile } from '@sovereign-academy/types';

import { downloadFileFromGithub, keepOnlyMostRecentCommits } from './utils';

const parseCommit = (commit: Commit) => {
  const kinds: ChangeKind[] = ['added', 'modified', 'removed'];

  return kinds.flatMap((kind) =>
    commit[kind].map((path) => ({
      path,
      kind,
      commit: commit.id,
      time: commit.timestamp,
    }))
  );
};

export const createGitHubWebhooks = (path: string, secret: string) => {
  if (!secret) throw new Error('GitHub Webhooks secret is required');

  const webhooks = new Webhooks({
    secret,
  });

  webhooks.on('push', async ({ payload }) => {
    const repository = payload.repository.full_name;
    const sourceUrl = payload.repository.html_url;
    const parsed: ChangedFile[] = payload.commits
      .flatMap(parseCommit)
      .map((item) => ({
        ...item,
        url: `https://raw.githubusercontent.com/${repository}/${item.commit}/${item.path}`,
      }));

    // We only need the most recent commit for each file as we are downloading the full file anyway
    const content = keepOnlyMostRecentCommits(parsed);

    // Download all added or modified files
    await async.eachLimit(content, 10, async (item) => {
      if (item.kind === 'removed' || item.path.includes('assets')) return;
      item.data = await downloadFileFromGithub(item.path);
    });

    return processChangedFiles(content, sourceUrl);
  });

  return {
    webhooks,
    middleware: createNodeMiddleware(webhooks, { path }),
  };
};

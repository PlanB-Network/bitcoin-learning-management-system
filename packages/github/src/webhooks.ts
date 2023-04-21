import { verify } from '@octokit/webhooks-methods';
import type { Commit, PushEvent } from '@octokit/webhooks-types';
import * as async from 'async';

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

/**
 * GitHub sends its JSON with no indentation and no line break at the end
 */
const toNormalizedJsonString = (payload: any) => {
  const payloadString = JSON.stringify(payload);
  return payloadString.replace(/[^\\]\\u[\da-f]{4}/g, (s) => {
    return s.substr(0, 3) + s.substr(3).toUpperCase();
  });
};

export const verifyWebhookPayload = async (
  secret: string,
  payload: object | string,
  signature: string
) => {
  if (!secret) throw new Error('GitHub Webhooks secret is required');

  return verify(
    secret,
    typeof payload === 'object' ? toNormalizedJsonString(payload) : payload,
    signature
  );
};

export const processWebhookPayload = async (payload: PushEvent) => {
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

  return {
    content,
    sourceUrl,
  };
};

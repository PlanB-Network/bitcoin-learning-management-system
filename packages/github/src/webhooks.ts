import { verify } from '@octokit/webhooks-methods';
import type { PushEvent } from '@octokit/webhooks-types';
import * as async from 'async';

import type {
  ChangeKind,
  ChangedAsset,
  ChangedFile,
} from '@sovereign-academy/types';

import { GithubOctokit, createDownloadFile, createGetDiff } from './utils';

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

export const createProcessWebhookPayload =
  (octokit: GithubOctokit) => async (payload: PushEvent) => {
    const getDiff = createGetDiff(octokit);
    const downloadFile = createDownloadFile(octokit);

    const commits = payload.commits;
    const repository = payload.repository.full_name;

    // Get the diff between the last commit before and after the push
    const files = await getDiff(repository, payload.before, payload.after);

    // Download all added or modified files (skip removed files)
    const content = await async.mapLimit(
      files,
      10,
      async (item: (typeof files)[number]) => {
        // Get the most recent commit for this file
        const commit = commits
          .filter(
            (c) =>
              c.modified.includes(item.filename) ||
              c.added.includes(item.filename) ||
              c.removed.includes(item.filename)
          )
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

        // Get the timestamp of the commit, default to the latest commit timestamp if none found
        const time = new Date(
          commit[0]
            ? commit[0].timestamp
            : payload.head_commit
            ? payload.head_commit.timestamp
            : Date.now()
        ).getTime();

        const kind = item.status as ChangeKind;
        const common = {
          path: item.filename,
          commit: commit[0] ? commit[0].id : payload.after,
          time,
        };

        if (item.filename.includes('assets')) {
          const asset: ChangedAsset = {
            ...common,
            url: item.raw_url,
            ...(isRenamed(kind)
              ? { kind: 'renamed', previousPath: item.previous_filename as string }
              : { kind }),
          };

          return asset;
        }

        const file: ChangedFile = {
          ...common,
          data: await downloadFile(repository, item.filename),
          ...(isRenamed(kind)
            ? { kind: 'renamed', previousPath: item.previous_filename as string }
            : { kind }),
        };

        return file;
      }
    );

    return {
      content,
      sourceUrl: payload.repository.html_url,
    };
  };

function isRenamed(changeKind: ChangeKind): changeKind is Extract<ChangeKind, 'renamed'> {
  return changeKind === 'renamed';
}

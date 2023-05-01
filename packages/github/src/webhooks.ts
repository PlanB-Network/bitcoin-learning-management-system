import { verify } from '@octokit/webhooks-methods';
import type { PushEvent } from '@octokit/webhooks-types';

import type { GithubOctokit } from './octokit';
import { createGetChangedFiles } from './utils';

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
    const getChangedFiles = createGetChangedFiles(octokit);

    const repository = payload.repository.full_name;

    // Get the diff between the last commit before and after the push
    const files = await getChangedFiles(
      repository,
      payload.before,
      payload.after
    );

    return {
      files,
      sourceUrl: payload.repository.html_url,
    };
  };

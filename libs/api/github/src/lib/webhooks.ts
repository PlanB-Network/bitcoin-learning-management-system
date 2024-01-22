import { verify } from '@octokit/webhooks-methods';
import type { PushEvent } from '@octokit/webhooks-types';

import { compareCommits } from './utils';

/**
 * GitHub sends its JSON with no indentation and no line break at the end
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toNormalizedJsonString = (payload: any) => {
  const payloadString = JSON.stringify(payload);
  return payloadString.replace(/[^\\]\\u[\da-f]{4}/g, (s) => {
    return s.substr(0, 3) + s.substr(3).toUpperCase();
  });
};

export const verifyWebhookPayload = async (
  secret: string,
  payload: object | string,
  signature: string,
) => {
  if (!secret) throw new Error('GitHub Webhooks secret is required');

  return verify(
    secret,
    typeof payload === 'object' ? toNormalizedJsonString(payload) : payload,
    signature,
  );
};

export const processWebhookPayload = async (payload: PushEvent) => {
  return compareCommits(
    payload.repository.html_url,
    payload.repository.default_branch,
    payload.before,
    payload.after,
  );
};

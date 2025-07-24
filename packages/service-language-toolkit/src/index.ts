import { z } from 'zod';

export interface LanguageToolkitClientConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  /** Optional custom fetch implementation (defaults to global fetch) */
  fetchFn?: typeof fetch;
}

export interface TranslateCoursePayload {
  course_id: string;
  source_lang: string;
  target_langs: string[];
  use_english?: boolean;
}

export interface LanguageToolkitClient {
  translateCourse: (payload: TranslateCoursePayload) => Promise<string | null>;
  pollTask: (
    taskId: string,
    opts?: { intervalMs?: number; maxAttempts?: number },
  ) => Promise<unknown | null>;
}

/**
 * Factory that returns a strongly-typed client for the Language Toolkit API.
 */
export const createLanguageToolkitClient = (
  cfg: LanguageToolkitClientConfig,
): LanguageToolkitClient => {
  const fetchImpl: typeof fetch = cfg.fetchFn ?? fetch;

  let accessToken: string | null = null;
  let tokenExpiry = 0;

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const ensureToken = async () => {
    const now = Date.now();
    if (accessToken && now < tokenExpiry - 30_000) return accessToken;

    const params = new URLSearchParams();
    params.append('username', cfg.clientId);
    params.append('password', cfg.clientSecret);

    const res = await fetchImpl(`${cfg.baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!res.ok) throw new Error('LT token fetch failed');

    const dataSchema = z.object({
      access_token: z.string(),
      expires_in: z.number(),
    });
    const data = dataSchema.parse(await res.json());

    accessToken = data.access_token;
    tokenExpiry = now + data.expires_in * 1000;
    return accessToken;
  };

  /* ------------------------------------------------------------------ */
  /* Public API                                                         */
  /* ------------------------------------------------------------------ */
  const translateCourse: LanguageToolkitClient['translateCourse'] = async (
    payload,
  ) => {
    if (!cfg.baseUrl) {
      console.warn('[LT] baseUrl not set – skipping Toolkit call');
      return null;
    }
    try {
      const token = await ensureToken();
      const resp = await fetchImpl(`${cfg.baseUrl}/translate/course_s3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        console.error('[LT] translate/course_s3 failed', resp.status);
        return null;
      }

      const dataSchema = z.object({ task_id: z.string().optional() });
      const data = dataSchema.parse(await resp.json());
      return data.task_id ?? null;
    } catch (e) {
      console.error('[LT] translateCourse error', e);
      return null;
    }
  };

  const pollTask: LanguageToolkitClient['pollTask'] = async (
    taskId,
    { intervalMs = 5000, maxAttempts = 120 } = {},
  ) => {
    if (!cfg.baseUrl) return null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const token = await ensureToken();
        const resp = await fetchImpl(`${cfg.baseUrl}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          console.error('[LT] Task poll failed', resp.status);
          return null;
        }
        const dataSchema = z.object({
          status: z.string(),
          manifest: z.unknown().optional(),
        });
        const data = dataSchema.parse(await resp.json());
        if (data.status === 'completed') {
          return data.manifest ?? null;
        }
      } catch (err) {
        console.error('[LT] Error polling task', err);
        return null;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    console.warn('[LT] Task polling timed out');
    return null;
  };

  return {
    translateCourse,
    pollTask,
  };
};

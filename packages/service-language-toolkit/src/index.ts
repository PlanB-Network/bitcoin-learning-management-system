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

      // Add a timeout to prevent hanging on large course translations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 240000); // 240 second timeout for initial request (2 minutes)

      const resp = await fetchImpl(`${cfg.baseUrl}/translate/course_s3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errorText = await resp.text().catch(() => 'Unknown error');
        console.error(
          '[LT] translate/course_s3 failed',
          resp.status,
          errorText,
        );

        // Throw error with details for proper error handling
        throw new Error(
          `Translation API failed with status ${resp.status}: ${errorText}`,
        );
      }

      const dataSchema = z.object({ task_id: z.string().optional() });
      const data = dataSchema.parse(await resp.json());
      return data.task_id ?? null;
    } catch (e) {
      // Re-throw to allow caller to handle the error appropriately
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          throw new Error('Translation request timed out after 240 seconds');
        }
        throw e;
      }
      console.error('[LT] translateCourse error', e);
      throw new Error('Failed to start translation');
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
          throw new Error(`Failed to poll task status: ${resp.status}`);
        }
        const dataSchema = z.object({
          status: z.string(),
          manifest: z.unknown().optional(),
          error: z.union([z.string(), z.null()]).optional(),
        });
        const rawResponse = await resp.json();
        console.log(
          `[LT] Polling task ${taskId}, attempt ${attempt + 1}, response:`,
          rawResponse,
        );

        const data = dataSchema.parse(rawResponse);

        // Handle different task statuses
        if (data.status === 'completed') {
          console.log(`[LT] Task ${taskId} completed successfully`);
          return data.manifest ?? null;
        }
        if (data.status === 'failed') {
          const errorMsg = data.error || 'Translation task failed';
          console.error('[LT] Task failed:', errorMsg);
          throw new Error(errorMsg);
        }

        // If status is 'pending' or 'processing', continue polling
        console.log(
          `[LT] Task ${taskId} still ${data.status}, continuing to poll...`,
        );
      } catch (err) {
        // Re-throw to allow caller to handle the error
        if (err instanceof Error) {
          // If it's a Zod error, log more details for debugging
          if (err.name === 'ZodError') {
            console.error('[LT] Zod parsing error for task response:', err);
            console.error(
              '[LT] This might be due to unexpected API response format',
            );
          }
          throw err;
        }
        console.error('[LT] Error polling task', err);
        throw new Error('Failed to poll task status');
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    console.warn('[LT] Task polling timed out after', maxAttempts, 'attempts');
    throw new Error(
      `Task polling timed out after ${(maxAttempts * intervalMs) / 1000} seconds`,
    );
  };

  return {
    translateCourse,
    pollTask,
  };
};

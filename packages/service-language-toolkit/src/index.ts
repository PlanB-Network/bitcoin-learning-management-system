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

export interface TaskProgress {
  message: string;
  current?: number;
  total?: number;
}

export interface LanguageToolkitClient {
  translateCourse: (payload: TranslateCoursePayload) => Promise<string | null>;
  pollTask: (
    taskId: string,
    opts?: {
      intervalMs?: number;
      maxAttempts?: number;
      onProgress?: (progress: TaskProgress) => void;
    },
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

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unable to read response');
      throw new Error(
        `LT token fetch failed: ${res.status} ${res.statusText} - ${errorText}`,
      );
    }

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
    { intervalMs = 5000, maxAttempts = 120, onProgress } = {},
  ) => {
    if (!cfg.baseUrl) return null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const token = await ensureToken();
        const resp = await fetchImpl(`${cfg.baseUrl}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          // Non-OK responses might be temporary (503, 500, etc.)
          // Log and continue polling instead of throwing
          console.warn(
            `[LT] Task poll returned ${resp.status} on attempt ${attempt + 1}, will retry...`,
          );
          await new Promise((r) => setTimeout(r, intervalMs));
          continue;
        }

        const rawResponse = await resp.json();
        console.log(
          `[LT] Polling task ${taskId}, attempt ${attempt + 1}, response:`,
          rawResponse,
        );

        const dataSchema = z.object({
          status: z.string(),
          manifest: z.unknown().optional(),
          error: z.union([z.string(), z.null()]).optional(),
          progress: z.string().optional().nullable(),
          progress_current: z.number().optional().nullable(),
          progress_total: z.number().optional().nullable(),
        });
        const data = dataSchema.parse(rawResponse);

        // Call onProgress callback if provided
        if (onProgress && data.progress) {
          onProgress({
            message: data.progress,
            current: data.progress_current ?? undefined,
            total: data.progress_total ?? undefined,
          });
        }

        // Handle different task statuses
        if (data.status === 'completed') {
          console.log(`[LT] Task ${taskId} completed successfully`);
          return data.manifest ?? null;
        }
        if (data.status === 'failed') {
          // Task definitively failed - this is a critical error
          const errorMsg = data.error || 'Translation task failed';
          console.error('[LT] Task failed:', errorMsg);
          throw new Error(errorMsg);
        }

        // If status is 'pending' or 'processing', continue polling
        const progressInfo =
          data.progress_current && data.progress_total
            ? ` (${data.progress_current}/${data.progress_total})`
            : '';
        console.log(
          `[LT] Task ${taskId} still ${data.status}${progressInfo}, continuing to poll...`,
        );
      } catch (err) {
        // Check if this is a critical error (task failed) or a recoverable error
        if (err instanceof Error) {
          // Critical errors that should stop polling immediately
          if (
            err.message.includes('Translation task failed') ||
            err.message.includes('Task failed')
          ) {
            throw err;
          }

          // Recoverable errors (network issues, parsing errors, etc.)
          // Log and continue polling
          if (err.name === 'ZodError') {
            console.warn(
              `[LT] Zod parsing error on attempt ${attempt + 1}, will retry:`,
              err.message,
            );
          } else if (
            err.name === 'AbortError' ||
            err.message.includes('fetch')
          ) {
            console.warn(
              `[LT] Network error on attempt ${attempt + 1}, will retry:`,
              err.message,
            );
          } else {
            console.warn(
              `[LT] Error polling task on attempt ${attempt + 1}, will retry:`,
              err.message,
            );
          }

          // Continue to next attempt instead of throwing
          await new Promise((r) => setTimeout(r, intervalMs));
          continue;
        }

        // Unknown error type - log and continue
        console.warn(
          `[LT] Unknown error polling task on attempt ${attempt + 1}, will retry`,
        );
        await new Promise((r) => setTimeout(r, intervalMs));
        continue;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    // Exhausted all attempts
    console.error('[LT] Task polling timed out after', maxAttempts, 'attempts');
    throw new Error(
      `Task polling timed out after ${(maxAttempts * intervalMs) / 1000} seconds`,
    );
  };

  return {
    translateCourse,
    pollTask,
  };
};

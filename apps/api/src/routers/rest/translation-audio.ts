import type { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';
import { BadRequest, InternalServerError } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';

/**
 * Routes for generating slide audio using the external Language-Toolkit API.
 *
 * The route expects the translated text for a slide and forwards it to
 * the Language-Toolkit `/tts_text_s3` endpoint which generates an MP3 and
 * uploads it directly to our S3 bucket at the canonical key structure:
 *   `contribute/<courseId>/<language>/<partId>/<chapterId>/<slideId>/audio/<fileName>.mp3`.
 *
 * It returns the task information coming from the Language-Toolkit so the
 * caller can poll for completion if desired.
 */
export const createRestTranslationAudioRoutes = async (
  _dependencies: Dependencies,
  router: Router,
) => {
  /**
   * Start audio generation for a slide.
   *
   * Body parameters:
   *  - courseId       : string (uuid)
   *  - partId         : string (uuid)
   *  - chapterId      : string (uuid)
   *  - slideId        : string (uuid)
   *  - fileName       : string (e.g. "1.1_0") **without extension**
   *  - language       : ISO-639-1 language code (target language)
   *  - text           : string – translated transcript that must be voiced
   *  - voiceId        : optional – ElevenLabs voice_id to pass through
   */
  router.post(
    '/translation-audio/generate',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const {
          courseId,
          partId,
          chapterId,
          slideId,
          fileName,
          language,
          text,
          voiceId,
        } = req.body as Record<string, string | undefined>;

        if (
          !courseId ||
          !partId ||
          !chapterId ||
          !slideId ||
          !fileName ||
          !language ||
          !text
        ) {
          throw new BadRequest('Missing required parameters');
        }

        // Expected S3 key for the generated MP3
        const outputKey = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/audio/${fileName}.mp3`;

        // Base URL of the Language-Toolkit API (default to local dev instance)
        const toolkitUrl = process.env.LTK_URL ?? 'http://localhost:8000';

        // ------------------------------------------------------------------
        // 1. Get an auth token for Language-Toolkit
        //    a) Prefer a static token set in env (useful for dev / prod)
        //    b) Otherwise obtain a short-lived JWT via `/token`
        // ------------------------------------------------------------------

        let accessToken: string | undefined = process.env.LTK_STATIC_TOKEN;

        if (!accessToken) {
          const tokenResp = await fetch(`${toolkitUrl}/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            // In dev mode Language-Toolkit accepts any credentials if none
            // are configured. These can be set to anything or wired through env.
            body: new URLSearchParams({
              username: process.env.LTK_CLIENT_ID ?? 'blms-app',
              password: process.env.LTK_CLIENT_SECRET ?? 'blms-secret',
            }),
          });

          if (!tokenResp.ok) {
            throw new InternalServerError('Failed to obtain auth token');
          }

          const tokenJson = (await tokenResp.json()) as {
            access_token: string;
          };
          accessToken = tokenJson.access_token;
        }

        // ------------------------------------------------------------------
        // 2. Call /tts_text_s3 to start the text-to-speech task
        // ------------------------------------------------------------------
        const ttsBody: Record<string, any> = {
          text,
          output_key: outputKey,
        };
        if (voiceId) ttsBody.voice_id = voiceId;

        const ttsResp = await fetch(`${toolkitUrl}/tts_text_s3`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(ttsBody),
        });

        if (!ttsResp.ok) {
          const errText = await ttsResp.text();
          throw new InternalServerError(
            `Language-Toolkit error: ${ttsResp.status} ${errText}`,
          );
        }

        const taskInfo = await ttsResp.json();

        res.json({
          message: 'Audio generation task started',
          outputKey,
          toolkitTask: taskInfo,
        });
      } catch (err) {
        next(err);
      }
    },
  );

  /**
   * Proxy Language-Toolkit task status
   */
  router.get(
    '/translation-audio/tasks/:taskId',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const { taskId } = req.params as { taskId: string };
        if (!taskId) throw new BadRequest('taskId missing');

        const toolkitUrl = process.env.LTK_URL ?? 'http://localhost:8000';

        // Acquire token (reuse static token logic)
        let accessToken: string | undefined = process.env.LTK_STATIC_TOKEN;
        if (!accessToken) {
          const tokenResp = await fetch(`${toolkitUrl}/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              username: process.env.LTK_CLIENT_ID ?? 'blms-app',
              password: process.env.LTK_CLIENT_SECRET ?? 'blms-secret',
            }),
          });
          if (!tokenResp.ok) {
            throw new InternalServerError('Failed to obtain auth token');
          }
          const tokenJson = (await tokenResp.json()) as {
            access_token: string;
          };
          accessToken = tokenJson.access_token;
        }

        const statusResp = await fetch(`${toolkitUrl}/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!statusResp.ok) {
          const txt = await statusResp.text();
          throw new InternalServerError(`Toolkit status error: ${txt}`);
        }

        const body = await statusResp.json();
        res.json(body);
      } catch (err) {
        next(err);
      }
    },
  );
};

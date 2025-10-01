import {
  createGetSlideProfessor,
  createUpdateSlideAudioStatus,
} from '@blms/service-content';
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
// In-memory store for tracking audio generation tasks
const audioTasks = new Map<
  string,
  {
    courseId: string;
    partId: string;
    chapterId: string;
    slideId: string;
    fileName: string;
    language: string;
    outputKey: string;
    userId: string;
    createdAt: number;
  }
>();

// Clean up old task records every 30 minutes
setInterval(
  () => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    for (const [taskId, data] of audioTasks.entries()) {
      if (now - data.createdAt > maxAge) {
        audioTasks.delete(taskId);
      }
    }
  },
  30 * 60 * 1000,
);

export const createRestTranslationAudioRoutes = async (
  dependencies: Dependencies,
  router: Router,
) => {
  const updateSlideAudioStatus = createUpdateSlideAudioStatus(
    dependencies as any,
  );
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
   *
   * Note: Professor name for voice matching is automatically retrieved from
   * the course_translation_slides table using the provided slide identifiers.
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

        // Note: slideId comes from database via frontend, should have proper UUID format with dashes

        // Expected S3 key for the generated MP3
        const outputKey = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/audio/${fileName}.mp3`;

        // Get professor name from the course_translation_slides table
        const getSlideProfessor = createGetSlideProfessor(dependencies as any);
        const professorName = await getSlideProfessor({
          courseId,
          language,
          partId,
          chapterId,
          slideId,
        });

        console.log(
          `Using professor from slide data: ${professorName || 'none found'}`,
        );

        // Base URL of the Language-Toolkit API (default to local dev instance)
        const toolkitUrl = process.env.LT_BASE_URL ?? 'http://localhost:8000';

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
              username: process.env.LT_CLIENT_ID ?? 'blms-app',
              password: process.env.LT_CLIENT_SECRET ?? 'blms-secret',
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

        // Add voice_id if explicitly provided
        if (voiceId) {
          ttsBody.voice_id = voiceId;
        }

        // Add professor name for voice matching (if no explicit voice_id and professor found)
        if (professorName) {
          ttsBody.professor = professorName;
        }

        console.log('Sending TTS request to Language-Toolkit:', {
          ...ttsBody,
          text: `${text.substring(0, 100)}...`, // Log truncated text for debugging
        });

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

        // Store task information for completion tracking
        if ((taskInfo as any)?.task_id) {
          audioTasks.set((taskInfo as any).task_id, {
            courseId,
            partId,
            chapterId,
            slideId,
            fileName,
            language,
            outputKey,
            userId: req.session.uid!,
            createdAt: Date.now(),
          });
          console.log(
            'Started audio generation task:',
            (taskInfo as any).task_id,
          );
        }

        res.json({
          message: 'Audio generation task started',
          outputKey,
          toolkitTask: taskInfo,
          professorFound: !!professorName,
          voiceSelectionMethod: voiceId
            ? 'explicit_voice_id'
            : professorName
              ? 'slide_professor_matching'
              : 'default_fallback',
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

        const toolkitUrl = process.env.LT_BASE_URL ?? 'http://localhost:8000';

        // Acquire token (reuse static token logic)
        let accessToken: string | undefined = process.env.LTK_STATIC_TOKEN;
        if (!accessToken) {
          const tokenResp = await fetch(`${toolkitUrl}/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              username: process.env.LT_CLIENT_ID ?? 'blms-app',
              password: process.env.LT_CLIENT_SECRET ?? 'blms-secret',
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

        const taskData = audioTasks.get(taskId);

        const statusResp = await fetch(`${toolkitUrl}/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let body: any | null = null;

        if (!statusResp.ok) {
          const txt = await statusResp.text();

          // Fallback handling: Some Language-Toolkit deployments use multiple workers.
          // The in-memory task registry can be worker-local, so GET /tasks/:id may 404
          // even though the task completed and wrote the S3 object.
          if (statusResp.status === 404 && taskData?.outputKey) {
            try {
              await (dependencies as any).s3.head(taskData.outputKey);
              // Object exists in S3 → treat as completed
              body = { status: 'completed', task_id: taskId };
            } catch (_e) {
              // Object not found yet → report pending to avoid surfacing 5xx to the client
              body = { status: 'pending', task_id: taskId };
            }
          } else {
            // Unknown error from toolkit – return graceful pending state
            body = { status: 'pending', task_id: taskId, error: txt };
          }
        } else {
          body = await statusResp.json();
        }

        // Check if task is completed and update database
        if ((body as any)?.status === 'completed') {
          if (taskData) {
            console.log('Audio task completed, updating database:', {
              taskId,
              audioPath: taskData.outputKey,
              courseId: taskData.courseId,
              slideId: taskData.slideId,
            });

            try {
              await updateSlideAudioStatus(
                taskData.courseId,
                taskData.language,
                taskData.partId,
                taskData.chapterId,
                taskData.slideId,
                taskData.outputKey,
              );
              console.log(
                'Successfully updated audio_resource_path in database',
              );

              // Clean up task record
              audioTasks.delete(taskId);
            } catch (error) {
              console.error('Error updating audio_resource_path:', error);
            }
          } else {
            console.warn('Completed task not found in tracking map:', taskId);
          }
        }

        res.json(body);
      } catch (err) {
        next(err);
      }
    },
  );
};

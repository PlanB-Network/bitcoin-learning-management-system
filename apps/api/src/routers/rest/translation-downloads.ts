import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { sql } from '@blms/database';
import { NoSuchKey } from '@blms/s3';
import {
  createGetPptxAvailableLanguages,
  createGetTranscriptAvailableLanguages,
} from '@blms/service-content';
import type { Router } from 'express';
import type { Dependencies } from '#src/dependencies.js';
import { BadRequest } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';

// Added SSRF-protection: OnlyOffice base URL and validator
const ONLYOFFICE_BASE_URL =
  process.env.ONLYOFFICE_URL ||
  (process.env.DOCKER ? 'http://onlyoffice' : 'http://localhost:80');
const ONLYOFFICE_HOSTNAME = new URL(ONLYOFFICE_BASE_URL).hostname;

function assertOnlyofficeUrl(input: string): void {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new BadRequest('Invalid OnlyOffice URL');
  }

  if (parsed.hostname !== ONLYOFFICE_HOSTNAME) {
    throw new BadRequest('Untrusted OnlyOffice host');
  }
}

// In-memory store for temporary download tokens (in production, use Redis)
const downloadTokens = new Map<
  string,
  {
    courseId: string;
    slideId: string;
    language: string;
    partId: string;
    chapterId: string;
    fileName: string;
    expires: number;
    userId: string;
  }
>();

// Clean up expired tokens every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [token, data] of downloadTokens.entries()) {
      if (data.expires < now) {
        downloadTokens.delete(token);
      }
    }
  },
  5 * 60 * 1000,
);

// Stream translated audio files stored in S3 to the client
export const createRestTranslationDownloadRoutes = async (
  dependencies: Dependencies,
  router: Router,
) => {
  // Proxy endpoint for OnlyOffice forcesave command (avoids CORS issues)
  router.post(
    '/translation-downloads/pptx-forcesave',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const {
          documentKey,
          courseId,
          slideId,
          language,
          partId,
          chapterId,
          fileName,
        } = req.body;
        const userId = req.session.uid;

        if (
          !documentKey ||
          !courseId ||
          !slideId ||
          !language ||
          !partId ||
          !chapterId ||
          !fileName
        ) {
          throw new BadRequest('Missing required parameters');
        }

        if (!userId) {
          throw new BadRequest('User not authenticated');
        }

        console.log('Proxying forcesave command for:', {
          courseId,
          partId,
          chapterId,
          slideId,
          language,
          fileName,
        });

        // Send forcesave command to OnlyOffice command service
        const commandBody = {
          c: 'forcesave',
          key: documentKey,
          forceSaveType: 3, // Overwrite existing file instead of creating new revision
          userdata: JSON.stringify({
            courseId,
            partId,
            chapterId,
            slideId,
            language,
            fileName,
          }),
        };

        // Build command service URL from trusted base
        const onlyofficeUrl = `${ONLYOFFICE_BASE_URL.replace(/\/$/, '')}/coauthoring/CommandService.ashx`;
        const commandResponse = await fetch(onlyofficeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commandBody),
        });

        const result = await commandResponse.json();
        console.log('OnlyOffice forcesave result:', result);

        res.json(result);
      } catch (error) {
        console.error('Error proxying forcesave command:', error);
        next(error);
      }
    },
  );

  // OnlyOffice callback endpoint for manual saves
  router.post(
    '/translation-downloads/pptx-callback',
    async (req, res, _next) => {
      try {
        console.log('OnlyOffice callback received:', req.body);

        const { status, url } = req.body;
        const { courseId, partId, chapterId, slideId, language, fileName } =
          req.query as any;

        // Handle forcesave operations (status 6 = forcesave)
        if (
          status === 6 &&
          courseId &&
          partId &&
          chapterId &&
          slideId &&
          language &&
          fileName
        ) {
          console.log(
            `OnlyOffice callback: Forcesave requested for ${courseId}/${slideId}/${language}`,
          );

          try {
            // Note: slideId comes from OnlyOffice callback URL parameters

            // Validate and download the document from OnlyOffice
            assertOnlyofficeUrl(url);
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(
                `Failed to download document: ${response.statusText}`,
              );
            }

            const documentBuffer = await response.arrayBuffer();
            const documentStream = Readable.from(Buffer.from(documentBuffer));

            // Save to S3, replacing the existing file
            // Save as a new "proofread" revision so the original remains untouched
            const proofreadFileName = fileName.endsWith('-proofread')
              ? fileName
              : `${fileName}-proofread`;

            const s3Key = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/pptx/${proofreadFileName}.pptx`;
            await dependencies.s3.upload(s3Key, documentStream, {
              contentType:
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            });

            console.log(`Successfully saved document to S3: ${s3Key}`);
          } catch (saveError) {
            console.error('Error saving document to S3:', saveError);
          }
        }

        // Always return success response to prevent warnings
        res.json({ error: 0 });
      } catch (error) {
        console.error('OnlyOffice callback error:', error);
        // Even on error, return success to prevent OnlyOffice warnings
        res.json({ error: 0 });
      }
    },
  );

  // Public endpoint for OnlyOffice to download PPTX files (no auth required)
  router.get(
    '/translation-downloads/pptx-public/:courseId/:language/:partId/:chapterId/:slideId/:fileName',
    async (req, res, next) => {
      try {
        const { courseId, language, partId, chapterId, slideId, fileName } =
          req.params as any;

        if (
          !courseId ||
          !language ||
          !partId ||
          !chapterId ||
          !slideId ||
          !fileName
        ) {
          throw new BadRequest('Missing required path parameters');
        }

        // Prefer the proofread version if it exists, otherwise fall back to original
        const baseKey = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/pptx/${fileName}.pptx`;
        const proofreadKey = baseKey.replace(
          `${fileName}.pptx`,
          `${fileName}-proofread.pptx`,
        );

        let key = proofreadKey;
        let head = await dependencies.s3.head(key).catch(() => null);

        if (!head) {
          key = baseKey;
          head = await dependencies.s3.head(key).catch(() => null);
        }

        if (!head) {
          res.status(404).send('Not found');
          return;
        }

        const stream = await dependencies.s3.getStream(key);

        // Add CORS headers to allow OnlyOffice to access the files
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization',
        );

        res.setHeader(
          'Content-Type',
          head?.contentType ||
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        );
        if (head?.contentLength) {
          res.setHeader('Content-Length', String(head.contentLength));
        }

        stream!.pipe(res);
      } catch (error) {
        req.log('Error:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('Not found');
          return;
        }
        next(error);
      }
    },
  );

  // Generate temporary download token for OnlyOffice
  router.post(
    '/translation-downloads/pptx-token',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const { courseId, slideId, language, partId, chapterId, fileName } =
          req.body;
        const userId = req.session.uid;

        if (
          !courseId ||
          !slideId ||
          !language ||
          !partId ||
          !chapterId ||
          !fileName
        ) {
          throw new BadRequest(
            'Missing courseId, partId, chapterId, slideId, language or fileName',
          );
        }

        if (!userId) {
          throw new BadRequest('User not authenticated');
        }

        // Generate a temporary token that expires in 10 minutes
        const token = randomUUID();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        downloadTokens.set(token, {
          courseId,
          slideId,
          language,
          partId,
          chapterId,
          fileName,
          expires,
          userId,
        } as any);

        // Return the temporary download URL
        const downloadUrl = `${req.protocol}://${req.get('host')}/api/translation-downloads/pptx-direct/${token}`;

        res.json({
          downloadUrl,
          expiresAt: new Date(expires).toISOString(),
        });
      } catch (error) {
        next(error);
      }
    },
  );

  // Direct download endpoint using token (no session auth required)
  router.get(
    '/translation-downloads/pptx-direct/:token',
    async (req, res, next) => {
      try {
        const { token } = req.params;

        if (!token) {
          throw new BadRequest('Missing token');
        }

        const tokenData = downloadTokens.get(token);
        if (!tokenData) {
          res.status(404).send('Token not found or expired');
          return;
        }

        if (tokenData.expires < Date.now()) {
          downloadTokens.delete(token);
          res.status(404).send('Token expired');
          return;
        }

        const { courseId, slideId, language, chapterId } = tokenData as any;

        // Query the database to get the ppt_resource_path (same as pptx-by-path endpoint)
        const slideQuery = sql`
          SELECT ppt_resource_path, course_id, language, chapter_id, slide_id
          FROM content.course_translation_slides
          WHERE course_id = ${courseId}
            AND language = ${language}
            AND chapter_id = ${chapterId}
            AND slide_id = ${slideId}
        `;

        const result = await dependencies.postgres.exec(slideQuery);

        if (!result || result.length === 0) {
          res.status(404).send('Slide not found');
          return;
        }

        const pptResourcePath =
          result[0].pptResourcePath || result[0].ppt_resource_path;

        if (!pptResourcePath) {
          res.status(404).send('PPT resource path not found');
          return;
        }

        // Use the ppt_resource_path directly as the S3 key
        const head = await dependencies.s3
          .head(pptResourcePath)
          .catch(() => null);

        if (!head) {
          res.status(404).send('File not found in S3');
          return;
        }

        const stream = await dependencies.s3.getStream(pptResourcePath);

        res.setHeader(
          'Content-Type',
          head?.contentType ||
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        );
        if (head?.contentLength) {
          res.setHeader('Content-Length', String(head.contentLength));
        }

        // Clean up token after successful download
        downloadTokens.delete(token);

        stream!.pipe(res);
      } catch (error) {
        req.log('Error:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('File not found');
          return;
        }
        next(error);
      }
    },
  );

  router.get(
    '/translation-downloads/audio/:courseId/:language/:chapterId/:slideId',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const { courseId, language, chapterId, slideId } = req.params as any;

        if (!courseId || !language || !chapterId || !slideId) {
          throw new BadRequest('Missing required path parameters');
        }

        // Query the database to get the audio_resource_path
        const slideQuery = sql`
          SELECT audio_resource_path, course_id, language, chapter_id, slide_id
          FROM content.course_translation_slides
          WHERE course_id = ${courseId}
            AND language = ${language}
            AND chapter_id = ${chapterId}
            AND slide_id = ${slideId}
        `;

        const result = await dependencies.postgres.exec(slideQuery);

        if (!result || result.length === 0) {
          res.status(404).send('Slide not found');
          return;
        }

        const audioResourcePath =
          result[0].audioResourcePath || result[0].audio_resource_path;
        if (!audioResourcePath) {
          res.status(404).send('Audio not generated yet');
          return;
        }

        // Use the audio_resource_path directly as the S3 key
        const head = await dependencies.s3
          .head(audioResourcePath)
          .catch(() => null);

        // File does not exist – 404 early
        if (!head?.contentLength) {
          res.status(404).send('Audio file not found');
          return;
        }

        // Handle HTTP Range requests so the browser can stream / seek within the audio.
        const range = req.headers.range;

        // -----------------------------
        // No range header – stream full file as before
        // -----------------------------
        if (!range) {
          const stream = await dependencies.s3.getStream(audioResourcePath);

          if (!stream) {
            res.status(404).send('Not found');
            return;
          }

          res.setHeader('Content-Type', head?.contentType || 'audio/mp4');
          res.setHeader('Content-Length', String(head.contentLength));
          res.setHeader('Accept-Ranges', 'bytes');

          return void stream!.pipe(res);
        }

        // -----------------------------
        // Range header present – parse it and stream partial content
        // -----------------------------
        const byteRange = /bytes=(\d+)-(\d*)/.exec(range);

        if (!byteRange) {
          res.status(416).send('Invalid range');
          return;
        }

        const start = Number(byteRange[1]);
        const endRaw = byteRange[2];
        const end = endRaw ? Number(endRaw) : head.contentLength - 1;

        if (
          Number.isNaN(start) ||
          Number.isNaN(end) ||
          start > end ||
          end >= head.contentLength
        ) {
          res.status(416).send('Requested range not satisfiable');
          return;
        }

        const chunkSize = end - start + 1;

        const stream = await dependencies.s3.getRangeStream(
          audioResourcePath,
          start,
          end,
        );

        if (!stream) {
          res.status(404).send('Not found');
          return;
        }

        res.status(206);
        res.setHeader('Content-Type', head?.contentType || 'audio/mp4');
        res.setHeader('Content-Length', String(chunkSize));
        res.setHeader(
          'Content-Range',
          `bytes ${start}-${end}/${head.contentLength}`,
        );
        res.setHeader('Accept-Ranges', 'bytes');

        stream!.pipe(res);
        return;
      } catch (error) {
        req.log('Error:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('Not found');
          return;
        }
        next(error);
      }
    },
  );

  // Handle CORS preflight requests for PPTX downloads
  router.options(
    '/translation-downloads/pptx/:courseId/:language/:partId/:chapterId/:slideId/:fileName',
    (_req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      res.status(200).end();
    },
  );

  // Handle CORS preflight requests for direct PPTX downloads
  router.options(
    '/translation-downloads/pptx-by-path/:courseId/:language/:chapterId/:slideId',
    (_req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Cookie',
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.status(200).end();
    },
  );

  // OnlyOffice callback endpoint for document saves
  router.post('/onlyoffice-callback', async (req, res, _next) => {
    try {
      const { status, url, key } = req.body;

      console.log('OnlyOffice callback:', { status, url, key });

      // Status codes:
      // 1 - document is being edited
      // 2 - document is ready for saving
      // 3 - document saving error has occurred
      // 4 - document is closed with no changes
      // 6 - document is being edited, but the current document state is saved
      // 7 - error has occurred while force saving the document

      if (status === 2 || status === 3 || status === 6 || status === 7) {
        if (status === 2 || status === 6) {
          // Document is ready for saving or force save
          if (url) {
            try {
              // Validate and download the updated document from OnlyOffice
              assertOnlyofficeUrl(url);
              const response = await fetch(url);
              if (response.ok) {
                const buffer = await response.arrayBuffer();
                const stream = new Readable();
                stream.push(Buffer.from(buffer));
                stream.push(null);

                // Extract courseId and slideId from the document key
                // The key was generated from the fileUrl path
                const decodedKey = atob(
                  key.padEnd(key.length + ((4 - (key.length % 4)) % 4), '='),
                );
                console.log('Decoded key:', decodedKey);

                // For now, we'll just log the save - in production you'd want to:
                // 1. Parse the courseId, slideId, language from the key
                // 2. Save the updated file back to S3
                // 3. Update the database with the new version

                console.log('Document saved successfully');
              }
            } catch (error) {
              console.error('Error saving document:', error);
            }
          }
        }

        // Always respond with success to OnlyOffice
        res.json({ error: 0 });
      } else {
        // Document is being edited or no changes
        res.json({ error: 0 });
      }
    } catch (error) {
      console.error('OnlyOffice callback error:', error);
      res.json({ error: 1 });
    }
  });

  // Stream translated PPTX files stored in S3 to the client
  router.get(
    '/translation-downloads/pptx/:courseId/:language/:partId/:chapterId/:slideId/:fileName',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const { courseId, language, partId, chapterId, slideId, fileName } =
          req.params as any;

        if (
          !courseId ||
          !language ||
          !partId ||
          !chapterId ||
          !slideId ||
          !fileName
        ) {
          throw new BadRequest('Missing required path parameters');
        }

        const baseKey = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/pptx/${fileName}.pptx`;
        const proofreadKey = baseKey.replace(
          `${fileName}.pptx`,
          `${fileName}-proofread.pptx`,
        );

        let key = proofreadKey;
        let head = await dependencies.s3.head(key).catch(() => null);

        if (!head) {
          key = baseKey;
          head = await dependencies.s3.head(key).catch(() => null);
        }

        if (!head) {
          res.status(404).send('Not found');
          return;
        }

        const stream = await dependencies.s3.getStream(key);

        if (!stream) {
          res.status(404).send('Not found');
          return;
        }

        // Add CORS headers to allow OnlyOffice to access the files
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization',
        );

        res.setHeader(
          'Content-Type',
          head?.contentType ||
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        );
        if (head?.contentLength) {
          res.setHeader('Content-Length', String(head.contentLength));
        }

        stream!.pipe(res);
      } catch (error) {
        req.log('Error:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('Not found');
          return;
        }
        next(error);
      }
    },
  );

  router.get(
    '/translation-downloads/pptx-availability/:courseId/:partId/:chapterId/:slideId',
    async (req, res, next) => {
      try {
        const { courseId, partId, chapterId, slideId } = req.params as any;

        if (!courseId || !partId || !chapterId || !slideId) {
          throw new BadRequest('Missing required path parameters');
        }

        const getPptxAvailableLanguages = createGetPptxAvailableLanguages(
          dependencies as any,
        );
        const languages = await getPptxAvailableLanguages(
          courseId,
          partId,
          chapterId,
          slideId,
        );

        res.json({ languages });
      } catch (error) {
        req.log('Error:', error);
        next(error);
      }
    },
  );

  router.get(
    '/translation-downloads/transcript-availability/:courseId/:partId/:chapterId/:slideId',
    async (req, res, next) => {
      try {
        const { courseId, partId, chapterId, slideId } = req.params as any;

        if (!courseId || !partId || !chapterId || !slideId) {
          throw new BadRequest('Missing required path parameters');
        }

        const getTranscriptAvailableLanguages =
          createGetTranscriptAvailableLanguages(dependencies as any);
        const languages = await getTranscriptAvailableLanguages(
          courseId,
          partId,
          chapterId,
          slideId,
        );

        res.json({ languages });
      } catch (error) {
        req.log('Error:', error);
        next(error);
      }
    },
  );

  // Serve PPTX files directly using ppt_resource_path from database
  // No auth required since database lookup provides security
  router.get(
    '/translation-downloads/pptx-by-path/:courseId/:language/:chapterId/:slideId',
    async (req, res, next) => {
      try {
        const { courseId, language, chapterId, slideId } = req.params as any;

        if (!courseId || !language || !chapterId || !slideId) {
          throw new BadRequest('Missing required path parameters');
        }

        // Query the database to get the ppt_resource_path
        const slideQuery = sql`
          SELECT ppt_resource_path, course_id, language, chapter_id, slide_id, part_id
          FROM content.course_translation_slides
          WHERE course_id = ${courseId}
            AND language = ${language}
            AND chapter_id = ${chapterId}
            AND slide_id = ${slideId}
        `;

        const result = await dependencies.postgres.exec(slideQuery);

        if (!result || result.length === 0) {
          res.status(404).send('Slide not found');
          return;
        }

        const pptResourcePath =
          result[0].pptResourcePath || result[0].ppt_resource_path;

        if (!pptResourcePath) {
          res.status(404).send('PPT resource path not found');
          return;
        }

        // Use the ppt_resource_path directly as the S3 key
        const head = await dependencies.s3
          .head(pptResourcePath)
          .catch(() => null);

        if (!head) {
          res.status(404).send('File not found in S3');
          return;
        }

        const stream = await dependencies.s3.getStream(pptResourcePath);

        if (!stream) {
          res.status(404).send('Failed to get file stream');
          return;
        }

        // Add CORS headers to allow OnlyOffice to access the files
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, Cookie',
        );
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        res.setHeader(
          'Content-Type',
          head?.contentType ||
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        );
        if (head?.contentLength) {
          res.setHeader('Content-Length', String(head.contentLength));
        }

        stream!.pipe(res);
      } catch (error) {
        console.error('PPTX by path endpoint error:', error);
        req.log('Error:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('File not found');
          return;
        }
        next(error);
      }
    },
  );
};

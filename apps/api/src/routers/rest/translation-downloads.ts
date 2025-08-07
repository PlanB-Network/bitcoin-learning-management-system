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
import { convertSlideToProofreadPngs } from '#src/utils/convert-api.js';

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
        console.log('OnlyOffice callback query params:', req.query);

        const { status, url } = req.body;
        const { courseId, partId, chapterId, slideId, language, fileName } =
          req.query as any;

        // Handle forcesave operations (status 6 = forcesave) and regular saves (status 2 = ready for saving)
        if (
          (status === 6 || status === 2) &&
          courseId &&
          partId &&
          chapterId &&
          slideId &&
          language &&
          fileName
        ) {
          console.log(
            `OnlyOffice callback: Document save requested (status: ${status}) for ${courseId}/${slideId}/${language}`,
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
            // Extract original filename from ppt_resource_path to maintain consistency
            console.log(
              `[PPTX Callback] Query parameters: courseId=${courseId}, language=${language}, chapterId=${chapterId}, slideId=${slideId}`,
            );

            // Get ppt_resource_path from the database
            const slideQuery = sql`
              SELECT ppt_resource_path, course_id, language, chapter_id, slide_id
              FROM content.course_translation_slides
              WHERE course_id = ${courseId}
                AND language = ${language}
                AND chapter_id = ${chapterId}
                AND slide_id = ${slideId}
            `;

            const slideResult = await dependencies.postgres.exec(slideQuery);
            console.log(
              '[PPTX Callback] Database query result:',
              JSON.stringify(slideResult, null, 2),
            );

            // Check all possible field name variations
            const firstRow = slideResult?.[0];
            const pptResourcePath =
              firstRow?.ppt_resource_path || firstRow?.pptResourcePath;

            console.log(
              '[PPTX Callback] First row keys:',
              firstRow ? Object.keys(firstRow) : 'No first row',
            );
            console.log(
              '[PPTX Callback] Extracted ppt_resource_path:',
              pptResourcePath,
            );

            console.log(
              `[PPTX Callback] Request fileName from frontend: ${fileName}`,
            );
            console.log(
              `[PPTX Callback] ppt_resource_path from DB: ${pptResourcePath}`,
            );

            if (!pptResourcePath) {
              console.error(
                `[PPTX Callback] No ppt_resource_path found in database for courseId=${courseId}, language=${language}, chapterId=${chapterId}, slideId=${slideId}`,
              );
              // Return error - we cannot proceed without the original file path
              return res.json({
                error: 1,
                message: 'Original PPT resource path not found',
              });
            }

            // Extract the exact original filename from ppt_resource_path (this is the authoritative source)
            const originalFileName = pptResourcePath
              .split('/')
              .pop()
              ?.replace('.pptx', '');
            console.log(
              `[PPTX Callback] Extracted original filename from ppt_resource_path: ${originalFileName}`,
            );

            if (!originalFileName) {
              console.error(
                `[PPTX Callback] Failed to extract filename from ppt_resource_path: ${pptResourcePath}`,
              );
              return res.json({
                error: 1,
                message: 'Failed to extract original filename',
              });
            }

            // Create proofread version using the exact original filename with -proofread suffix
            const proofreadFileName = originalFileName.endsWith('-proofread')
              ? originalFileName
              : `${originalFileName}-proofread`;

            console.log(
              `[PPTX Callback] Final proofreadFileName: ${proofreadFileName}`,
            );

            const s3Key = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/pptx/${proofreadFileName}.pptx`;
            await dependencies.s3.upload(s3Key, documentStream, {
              contentType:
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            });

            console.log(
              `[PPTX Callback] Successfully saved document to S3: ${s3Key}`,
            );
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

  // Generate PNG images from PPTX endpoint
  router.post(
    '/translation-downloads/generate-png',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const { courseId, partId, chapterId, slideId, language } = req.body;
        const userId = req.session.uid;

        if (!courseId || !partId || !chapterId || !slideId || !language) {
          throw new BadRequest(
            'Missing required parameters: courseId, partId, chapterId, slideId, language',
          );
        }

        if (!userId) {
          throw new BadRequest('User not authenticated');
        }

        console.log('Generating PNG for slide:', {
          courseId,
          partId,
          chapterId,
          slideId,
          language,
        });

        // Get the PPTX path from the database
        const slideQuery = sql`
          SELECT ppt_resource_path, slide_number, cc.chapter_index, cp.part_index
          FROM content.course_translation_slides cts
          JOIN content.course_chapters cc ON cts.chapter_id = cc.chapter_id
          JOIN content.course_parts cp ON cts.part_id = cp.part_id
          WHERE cts.course_id = ${courseId}
            AND cts.language = ${language}
            AND cts.chapter_id = ${chapterId}
            AND cts.slide_id = ${slideId}
        `;

        const result = await dependencies.postgres.exec(slideQuery);
        if (!result || result.length === 0) {
          throw new BadRequest('Slide not found');
        }

        const slide = result[0];

        const pptResourcePath =
          slide.pptResourcePath || slide.ppt_resource_path;
        const slideNumber = slide.slideNumber || slide.slide_number;
        const partIndex = slide.partIndex || slide.part_index;
        const chapterIndex = slide.chapterIndex || slide.chapter_index;

        if (!pptResourcePath) {
          throw new BadRequest('PPTX resource path not found for this slide');
        }

        console.log('Original PPTX path:', pptResourcePath);

        // Build base filename (same logic as used in frontend for fileBaseName)
        const slideIndex = slideNumber ? slideNumber - 1 : 0; // Convert 1-based to 0-based
        const baseNameNoExt = `${partIndex}.${chapterIndex}_${slideIndex}`;

        // Build S3 directory path - same structure as audio and pptx
        const s3KeyDir = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/`;

        // Generate PNG images using ConvertAPI (proofread version only)
        await convertSlideToProofreadPngs(
          dependencies,
          s3KeyDir,
          baseNameNoExt,
          pptResourcePath,
        );

        console.log('PNG generation completed successfully');

        res.json({
          success: true,
          message: 'PNG images generated successfully',
          s3Path: `${s3KeyDir}png/`,
        });
      } catch (error) {
        console.error('Error generating PNG images:', error);
        next(error);
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

  // NEW: File discovery endpoints - find files by extension in resource directory

  // Helper function to discover files by extension in a directory
  const discoverFileByExtension = async (
    s3: typeof dependencies.s3,
    directoryPath: string,
    extension: string,
    suffix?: string,
  ): Promise<string | null> => {
    try {
      // List all objects in the directory using the S3 list method
      const objectKeys = await s3.list(directoryPath);

      if (!objectKeys || objectKeys.length === 0) {
        return null;
      }

      // Filter by extension and suffix
      const matchingFiles = objectKeys.filter((key: string) => {
        const fileName = key.split('/').pop() || '';
        const hasCorrectExtension = fileName
          .toLowerCase()
          .endsWith(`.${extension.toLowerCase()}`);

        if (!hasCorrectExtension) return false;

        // If suffix is specified, check for it
        if (suffix) {
          const baseNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
          return baseNameWithoutExt
            .toLowerCase()
            .endsWith(`-${suffix.toLowerCase()}`);
        }

        return true;
      });

      // Return the first matching file
      return matchingFiles.length > 0 ? matchingFiles[0] : null;
    } catch (_error) {
      return null;
    }
  };

  // PPTX Discovery Endpoint
  router.get(
    '/translation-downloads/pptx-by-discovery/:courseId/:language/:partId/:chapterId/:slideId',
    async (req, res, next) => {
      try {
        const { courseId, language, partId, chapterId, slideId } =
          req.params as any;
        const { suffix } = req.query as any;

        if (!courseId || !language || !partId || !chapterId || !slideId) {
          throw new BadRequest('Missing required path parameters');
        }

        // First, get the ppt_resource_path from database to know the directory
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

        // Extract directory path from the ppt_resource_path
        // Example: contribute/courseId/language/partId/chapterId/slideId/pptx/filename.pptx
        // We want: contribute/courseId/language/partId/chapterId/slideId/pptx/
        const directoryPath = pptResourcePath.substring(
          0,
          pptResourcePath.lastIndexOf('/') + 1,
        );

        // Discover PPTX file with optional suffix
        const discoveredKey = await discoverFileByExtension(
          dependencies.s3,
          directoryPath,
          'pptx',
          suffix,
        );

        if (!discoveredKey) {
          res.status(404).send('PPTX file not found');
          return;
        }

        // Get file and stream it
        const head = await dependencies.s3
          .head(discoveredKey)
          .catch(() => null);

        if (!head) {
          res.status(404).send('File not found in S3');
          return;
        }

        const stream = await dependencies.s3.getStream(discoveredKey);

        if (!stream) {
          res.status(404).send('Failed to get file stream');
          return;
        }

        // Add CORS headers
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
        console.error('PPTX discovery endpoint error:', error);
        req.log('Error:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('File not found');
          return;
        }
        next(error);
      }
    },
  );

  // MP3 Discovery Endpoint
  router.get(
    '/translation-downloads/mp3-by-discovery/:courseId/:language/:partId/:chapterId/:slideId',
    async (req, res, next) => {
      try {
        const { courseId, language, partId, chapterId, slideId } =
          req.params as any;

        if (!courseId || !language || !partId || !chapterId || !slideId) {
          throw new BadRequest('Missing required path parameters');
        }

        // Get the audio_resource_path from database (if it exists) to determine directory
        // If not, construct expected directory path
        const slideQuery = sql`
          SELECT audio_resource_path, ppt_resource_path, course_id, language, chapter_id, slide_id, part_id
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
        const pptResourcePath =
          result[0].pptResourcePath || result[0].ppt_resource_path;

        let directoryPath: string;

        if (audioResourcePath) {
          // Use existing audio path to determine directory
          directoryPath = audioResourcePath.substring(
            0,
            audioResourcePath.lastIndexOf('/') + 1,
          );
        } else if (pptResourcePath) {
          // Derive directory from ppt path (replace /pptx/ with /mp3/)
          const pptDir = pptResourcePath.substring(
            0,
            pptResourcePath.lastIndexOf('/') + 1,
          );
          directoryPath = pptDir.replace('/pptx/', '/mp3/');
        } else {
          // Construct expected directory path
          directoryPath = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/mp3/`;
        }

        // Discover MP3 file
        const discoveredKey = await discoverFileByExtension(
          dependencies.s3,
          directoryPath,
          'mp3',
        );

        if (!discoveredKey) {
          res.status(404).send('Audio file not found');
          return;
        }

        // Get file and stream it (with range support like existing audio endpoint)
        const head = await dependencies.s3
          .head(discoveredKey)
          .catch(() => null);

        if (!head?.contentLength) {
          res.status(404).send('Audio file not found');
          return;
        }

        // Handle HTTP Range requests (copied from existing audio endpoint)
        const range = req.headers.range;

        if (!range) {
          const stream = await dependencies.s3.getStream(discoveredKey);

          if (!stream) {
            res.status(404).send('Not found');
            return;
          }

          res.setHeader('Content-Type', head?.contentType || 'audio/mp3');
          res.setHeader('Content-Length', String(head.contentLength));
          res.setHeader('Accept-Ranges', 'bytes');

          return void stream!.pipe(res);
        }

        // Range header present - parse and stream partial content
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
          discoveredKey,
          start,
          end,
        );

        if (!stream) {
          res.status(404).send('Not found');
          return;
        }

        res.status(206);
        res.setHeader('Content-Type', head?.contentType || 'audio/mp3');
        res.setHeader('Content-Length', String(chunkSize));
        res.setHeader(
          'Content-Range',
          `bytes ${start}-${end}/${head.contentLength}`,
        );
        res.setHeader('Accept-Ranges', 'bytes');

        stream!.pipe(res);
        return;
      } catch (error) {
        console.error('MP3 discovery endpoint error:', error);
        req.log('Error:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('Not found');
          return;
        }
        next(error);
      }
    },
  );

  // PNG Discovery Endpoint
  router.get(
    '/translation-downloads/png-by-discovery/:courseId/:language/:partId/:chapterId/:slideId',
    async (req, res, next) => {
      try {
        const { courseId, language, partId, chapterId, slideId } =
          req.params as any;
        const { suffix } = req.query as any;

        if (!courseId || !language || !partId || !chapterId || !slideId) {
          throw new BadRequest('Missing required path parameters');
        }

        // Get the ppt_resource_path from database to determine directory structure
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

        let directoryPath: string;

        if (pptResourcePath) {
          // Derive directory from ppt path (replace /pptx/ with /png/)
          const pptDir = pptResourcePath.substring(
            0,
            pptResourcePath.lastIndexOf('/') + 1,
          );
          directoryPath = pptDir.replace('/pptx/', '/png/');
        } else {
          // Construct expected directory path
          directoryPath = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/png/`;
        }

        // Discover PNG file with optional suffix
        const discoveredKey = await discoverFileByExtension(
          dependencies.s3,
          directoryPath,
          'png',
          suffix,
        );

        if (!discoveredKey) {
          res.status(404).send('PNG file not found');
          return;
        }

        // Get file and stream it
        const head = await dependencies.s3
          .head(discoveredKey)
          .catch(() => null);

        if (!head) {
          res.status(404).send('File not found in S3');
          return;
        }

        const stream = await dependencies.s3.getStream(discoveredKey);

        if (!stream) {
          res.status(404).send('Failed to get file stream');
          return;
        }

        res.setHeader('Content-Type', head?.contentType || 'image/png');
        if (head?.contentLength) {
          res.setHeader('Content-Length', String(head.contentLength));
        }

        stream!.pipe(res);
      } catch (error) {
        console.error('PNG discovery endpoint error:', error);
        req.log('Error:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('File not found');
          return;
        }
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

        // Query the database to get the ppt_resource_path and ppt_validated status
        const slideQuery = sql`
          SELECT ppt_resource_path, ppt_validated, course_id, language, chapter_id, slide_id, part_id
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
        const pptValidated = result[0].pptValidated || result[0].ppt_validated;

        console.log(
          `[PPTX by path] Query params: courseId=${courseId}, language=${language}, chapterId=${chapterId}, slideId=${slideId}`,
        );
        console.log(
          `[PPTX by path] pptResourcePath: ${pptResourcePath}, pptValidated: ${pptValidated}`,
        );

        if (!pptResourcePath) {
          res.status(404).send('PPT resource path not found');
          return;
        }

        // If ppt_validated is true, try to serve the proofread version first
        let keyToServe = pptResourcePath;

        if (pptValidated) {
          // Extract original filename from ppt_resource_path and build proofread key
          const originalFileName = pptResourcePath
            .split('/')
            .pop()
            ?.replace('.pptx', '');
          if (originalFileName) {
            const proofreadFileName = originalFileName.endsWith('-proofread')
              ? originalFileName
              : `${originalFileName}-proofread`;

            // Build proofread S3 key by replacing the filename
            const proofreadKey = pptResourcePath.replace(
              /\/[^/]+\.pptx$/,
              `/${proofreadFileName}.pptx`,
            );

            // Check if proofread version exists
            const proofreadHead = await dependencies.s3
              .head(proofreadKey)
              .catch((error) => {
                console.log(
                  `[PPTX by path] Proofread version check failed for ${proofreadKey}:`,
                  error?.message || 'Unknown error',
                );
                return null;
              });
            if (proofreadHead) {
              keyToServe = proofreadKey;
              console.log(
                `[PPTX by path] Serving proofread version: ${proofreadKey}, size: ${proofreadHead.contentLength} bytes`,
              );
            } else {
              console.log(
                `[PPTX by path] Proofread version not found, serving original: ${pptResourcePath}`,
              );
            }
          }
        }

        // Use the determined S3 key
        console.log(`[PPTX by path] Final key to serve: ${keyToServe}`);
        const head = await dependencies.s3.head(keyToServe).catch(() => null);

        if (!head) {
          console.log(
            `[PPTX by path] ERROR: Final key not found in S3: ${keyToServe}`,
          );
          res.status(404).send('File not found in S3');
          return;
        }

        console.log(
          `[PPTX by path] Final file exists, size: ${head.contentLength} bytes, content-type: ${head.contentType}`,
        );
        const stream = await dependencies.s3.getStream(keyToServe);

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

  // Simple PNG by path endpoint - direct S3 path construction
  router.get(
    '/translation-downloads/png-by-path/:courseId/:language/:chapterId/:slideId',
    async (req, res, next) => {
      try {
        const { courseId, language, chapterId, slideId } = req.params as any;
        const { suffix } = req.query as any;

        if (!courseId || !language || !chapterId || !slideId) {
          throw new BadRequest('Missing required path parameters');
        }

        // Get partId from database - we need this for the S3 path
        // First try to find the slide for the requested language
        const slideQuery = sql`
          SELECT part_id, ppt_resource_path
          FROM content.course_translation_slides
          WHERE course_id = ${courseId}
            AND language = ${language}
            AND chapter_id = ${chapterId}
            AND slide_id = ${slideId}
        `;

        let result = await dependencies.postgres.exec(slideQuery);

        // If not found for the requested language, try to find any slide for the same course/chapter/slide
        // to get the partId and base filename structure
        if (!result || result.length === 0) {
          const fallbackQuery = sql`
            SELECT part_id, ppt_resource_path
            FROM content.course_translation_slides
            WHERE course_id = ${courseId}
              AND chapter_id = ${chapterId}
              AND slide_id = ${slideId}
            LIMIT 1
          `;

          result = await dependencies.postgres.exec(fallbackQuery);

          if (!result || result.length === 0) {
            res.status(404).send('Slide not found');
            return;
          }
        }

        const partId = result[0].part_id || result[0].partId;
        const pptResourcePath =
          result[0].ppt_resource_path || result[0].pptResourcePath;

        if (!partId) {
          res.status(404).send('Part ID not found');
          return;
        }

        // Extract filename from ppt_resource_path to maintain consistency
        let baseFileName = 'slide'; // fallback
        if (pptResourcePath) {
          const extractedFileName = pptResourcePath
            .split('/')
            .pop()
            ?.replace('.pptx', '');
          if (extractedFileName) {
            baseFileName = extractedFileName;
          }
        }

        // Build PNG filename: baseFileName + suffix + .png
        const pngFileName = suffix
          ? `${baseFileName}-${suffix}.png`
          : `${baseFileName}.png`;

        // Direct S3 path construction following your example:
        // contribute/courseId/language/partId/chapterId/slideId/png/filename-proofread.png
        const pngKey = `contribute/${courseId}/${language}/${partId}/${chapterId}/${slideId}/png/${pngFileName}`;

        // Check if PNG file exists in S3
        const head = await dependencies.s3.head(pngKey).catch(() => null);

        if (!head) {
          res.status(404).send('PNG file not found');
          return;
        }

        const stream = await dependencies.s3.getStream(pngKey);

        if (!stream) {
          res.status(404).send('Failed to get PNG stream');
          return;
        }

        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, Cookie',
        );
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        res.setHeader('Content-Type', head?.contentType || 'image/png');
        if (head?.contentLength) {
          res.setHeader('Content-Length', String(head.contentLength));
        }

        stream!.pipe(res);
      } catch (error) {
        console.error('PNG by path endpoint error:', error);
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

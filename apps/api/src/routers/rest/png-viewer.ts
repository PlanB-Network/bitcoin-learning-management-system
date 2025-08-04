import { NoSuchKey } from '@blms/s3';
import type { Router } from 'express';
import type { Dependencies } from '#src/dependencies.js';
import { BadRequest } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';
import {
  buildOriginalPngDirectory,
  buildTranslatedPngKey,
  buildTranslatedProofreadPngKey,
} from '#src/utils/png-path.js';

// ------------------------------
// Simple in-memory cache for PNG availability
// Keyed by `${courseId}:${language}:${partId}:${chapterId}`
// Cached 5 minutes
// ------------------------------
const availabilityCache: Map<string, { data: any; timestamp: number }> =
  new Map();

// Stream PNG images stored in S3 to the admin panel
export const createRestPngViewerRoutes = async (
  dependencies: Dependencies,
  router: Router,
) => {
  // Get original PNG slide for admin viewing
  router.get(
    '/png-viewer/original/:courseId/:originalLanguage/:partId/:chapterId/:slideId/:fileName/:filename',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const {
          courseId,
          originalLanguage,
          partId,
          chapterId,
          slideId,
          filename, // actual png filename requested
        } = req.params as any;

        if (
          !courseId ||
          !originalLanguage ||
          !partId ||
          !chapterId ||
          !slideId ||
          !filename
        ) {
          throw new BadRequest('Missing required path parameters');
        }

        // Build path to original PNG directory
        const pngDirectory = buildOriginalPngDirectory(
          courseId,
          originalLanguage,
          partId,
          chapterId,
        );
        const key = `${pngDirectory}${filename}`;

        const head = await dependencies.s3.head(key).catch((err) => {
          console.log(
            '🔍 API: Failed to get head for original PNG:',
            err.message,
          );
          return null;
        });

        const stream = await dependencies.s3.getStream(key);

        if (!stream) {
          res.status(404).send('Could not stream original PNG file');
          return;
        }

        // Set appropriate headers for PNG files
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

        if (head?.contentLength) {
          res.setHeader('Content-Length', String(head.contentLength));
        }

        stream.pipe(res);
      } catch (error) {
        req.log('Error streaming original PNG:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('Original PNG file not found');
          return;
        }
        next(error);
      }
    },
  );

  // Get translated PNG slide for admin viewing
  router.get(
    '/png-viewer/translated/:courseId/:language/:partId/:chapterId/:slideId/:fileName/:slideNumber',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const {
          courseId,
          language,
          partId,
          chapterId,
          slideId,
          fileName,
          slideNumber,
        } = req.params as any;

        if (
          !courseId ||
          !language ||
          !partId ||
          !chapterId ||
          !slideId ||
          !fileName ||
          !slideNumber
        ) {
          throw new BadRequest('Missing required path parameters');
        }

        // Use the decoded fileName directly as it contains the full ppt_resource_path from DB
        const pptResourcePath = decodeURIComponent(fileName);

        // Try proofread version first (with -proofread suffix)
        let key = buildTranslatedProofreadPngKey(pptResourcePath);
        console.log(
          '🔍 API: Looking for translated PNG at S3 key (proofread):',
          key,
        );

        let head = await dependencies.s3.head(key).catch(() => null);

        // If proofread not found, try with slide number suffix
        if (!head && slideNumber) {
          const num = String(slideNumber).padStart(1, '');
          key = key.replace(/\.png$/i, `_${num}.png`);
          head = await dependencies.s3.head(key).catch(() => null);
        }

        // If still not found, fallback to regular translated PNG
        if (!head) {
          key = buildTranslatedPngKey(pptResourcePath);
          console.log(
            '🔍 API: Looking for translated PNG at S3 key (regular):',
            key,
          );
          head = await dependencies.s3.head(key).catch(() => null);

          // If regular not found and slideNumber is provided, try with suffix
          if (!head && slideNumber) {
            const num = String(slideNumber).padStart(1, '');
            key = key.replace(/\.png$/i, `_${num}.png`);
            console.log(
              '🔍 API: Looking for translated PNG at S3 key (regular with suffix):',
              key,
            );
            head = await dependencies.s3.head(key).catch(() => null);
          }
        }

        if (!head) {
          res.status(404).send('Translated PNG file not found');
          return;
        }

        const stream = await dependencies.s3.getStream(key);

        if (!stream) {
          res.status(404).send('Could not stream translated PNG file');
          return;
        }

        // Extract filename for header from the key
        const filename = key.split('/').pop() || `slide_${slideNumber}.png`;

        // Set appropriate headers for PNG files
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

        if (head?.contentLength) {
          res.setHeader('Content-Length', String(head.contentLength));
        }

        stream.pipe(res);
      } catch (error) {
        req.log('Error streaming translated PNG:', error);
        if (error instanceof NoSuchKey) {
          res.status(404).send('Translated PNG file not found');
          return;
        }
        next(error);
      }
    },
  );

  // ---------------------------------------------------------------------
  // Chapter-level PNG availability (lighter, cacheable)
  // GET /png-viewer/availability/:courseId/:translationLanguage/:originalLanguage/:partId/:chapterId
  // ---------------------------------------------------------------------

  router.get(
    '/png-viewer/availability/:courseId/:translationLanguage/:originalLanguage/:partId/:chapterId',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const {
          courseId,
          translationLanguage: language,
          originalLanguage,
          partId,
          chapterId,
        } = req.params as any;

        if (
          !courseId ||
          !language ||
          !originalLanguage ||
          !partId ||
          !chapterId
        ) {
          throw new BadRequest('Missing required path parameters');
        }

        const cacheKey = `${courseId}:${language}:${partId}:${chapterId}`;
        const now = Date.now();
        const TTL = 5 * 60 * 1000; // 5 minutes

        const cached = availabilityCache.get(cacheKey);
        if (cached && now - cached.timestamp < TTL) {
          res.setHeader(
            'Cache-Control',
            'public, max-age=300, stale-while-revalidate=600',
          );
          res.status(200).json(cached.data);
          return;
        }

        const originalPngDirectory = buildOriginalPngDirectory(
          courseId,
          originalLanguage,
          partId,
          chapterId,
        );

        let originalPngFiles: string[] = [];
        try {
          const keys = await dependencies.s3.list(originalPngDirectory);
          originalPngFiles = keys
            .filter((key) => key.toLowerCase().endsWith('.png'))
            .map((key) => key.replace(originalPngDirectory, ''))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        } catch (error) {
          console.error('🔍 API: Error listing original PNG files:', error);
        }

        const slides = originalPngFiles.map((filename, index) => ({
          slideNumber: index + 1,
          filename,
          original: true,
          translated: true, // Assume translated exists, skip extra S3 calls
        }));

        const result = {
          hasSlides: slides.length > 0,
          totalSlides: slides.length,
          slides,
          original: slides.length > 0,
          translated: true,
          canCompare: true,
          originalPngFiles,
        };

        // Store in cache
        availabilityCache.set(cacheKey, { data: result, timestamp: now });

        res.setHeader(
          'Cache-Control',
          'public, max-age=300, stale-while-revalidate=600',
        );
        res.status(200).json(result);
      } catch (error) {
        console.error('🔍 API: Error checking PNG availability:', error);
        req.log('Error checking PNG availability:', error);
        next(error);
      }
    },
  );

  // List PNG files in the pptx directory and check availability
  router.get(
    '/png-viewer/availability/:courseId/:translationLanguage/:originalLanguage/:partId/:chapterId/:slideId/:fileName',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const {
          courseId,
          translationLanguage: language,
          originalLanguage,
          partId,
          chapterId,
          slideId,
          fileName,
        } = req.params as any;

        if (
          !courseId ||
          !language ||
          !originalLanguage ||
          !partId ||
          !chapterId ||
          !slideId ||
          !fileName
        ) {
          console.error('🔍 API: Missing required path parameters');
          throw new BadRequest('Missing required path parameters');
        }

        // Scan S3 for original PNG files to get real filenames
        const originalPngDirectory = buildOriginalPngDirectory(
          courseId,
          originalLanguage,
          partId,
          chapterId,
        );

        // Get original PNG files (required for real filenames)
        let originalPngFiles: string[] = [];
        try {
          const keys = await dependencies.s3.list(originalPngDirectory);
          originalPngFiles = keys
            .filter((key) => key.toLowerCase().endsWith('.png'))
            .map((key) => key.replace(originalPngDirectory, ''))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        } catch (error) {
          console.error('🔍 API: Error listing original PNG files:', error);
        }

        // Skip expensive translated file check - assume translated exists
        // Let the client handle 404s when loading translated images
        const slides = originalPngFiles.map((filename, index) => ({
          slideNumber: index + 1,
          filename,
          original: true,
          translated: true, // Assume exists to avoid S3 head() calls
        }));

        const result = {
          hasSlides: slides.length > 0,
          totalSlides: slides.length,
          slides,
          original: slides.length > 0,
          translated: true, // Assume exists
          canCompare: true,
          originalPngFiles,
        };

        // Disable caching so that the frontend always receives a 200 with the JSON payload
        res.setHeader(
          'Cache-Control',
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        );
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');

        res.status(200).json(result);
      } catch (error) {
        console.error('🔍 API: Error checking PNG availability:', error);
        req.log('Error checking PNG availability:', error);
        next(error);
      }
    },
  );
};

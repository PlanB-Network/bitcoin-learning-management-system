import { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';

import { createRestCalendarRoutes } from './calendar.js';
import { createRestCouponsRoutes } from './coupons.js';
import { createRestEventRoutes } from './events.js';
import { createRestFilesRoutes } from './files.js';
import { createRestMentorRoutes } from './mentor.js';
import { createRestMetadataRoutes } from './metadata.js';
import { createRestPaymentRoutes } from './payment.js';
import { createRestPlanbProgramRoutes } from './planb-program.js';
import { createRestPngViewerRoutes } from './png-viewer.js';
import { createRestSyncRoutes } from './sync.js';
import { createRestTranslationAudioRoutes } from './translation-audio.js';
import { createRestTranslationDownloadRoutes } from './translation-downloads.js';
// import { createRestTranslationUploadRoutes } from './translation-uploads.js';
import { createRestTranslationUploadRoutes } from './translation-uploads.js';
import { createRestVersionRoutes } from './version.js';

export const createRestRouter = async (
  dependencies: Dependencies,
): Promise<Router> => {
  const router = Router();

  await createRestFilesRoutes(dependencies, router);
  await createRestTranslationDownloadRoutes(dependencies, router);
  await createRestPngViewerRoutes(dependencies, router);
  await createRestTranslationAudioRoutes(dependencies, router);
  // await createRestTranslationUploadRoutes(dependencies, router);
  await createRestTranslationUploadRoutes(dependencies, router);
  createRestMetadataRoutes(dependencies, router);
  createRestMentorRoutes(dependencies, router);
  createRestPaymentRoutes(dependencies, router);
  createRestSyncRoutes(dependencies, router);
  createRestPlanbProgramRoutes(dependencies, router);
  createRestEventRoutes(dependencies, router);
  createRestCouponsRoutes(dependencies, router);
  createRestCalendarRoutes(dependencies, router);
  createRestVersionRoutes(dependencies, router);

  return router;
};

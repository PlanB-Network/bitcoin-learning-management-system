import { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';

import { createRestCouponsRoutes } from './coupons.js';
import { createRestEventRoutes } from './events.js';
import { createRestFilesRoutes } from './files.js';
import { createRestMetadataRoutes } from './metadata.js';
import { createRestPaymentRoutes } from './payment.js';
import { createRestSyncRoutes } from './sync.js';
import { createRestTranslationUploadRoutes } from './translation-uploads.js';

export const createRestRouter = async (
  dependencies: Dependencies,
): Promise<Router> => {
  const router = Router();

  await createRestFilesRoutes(dependencies, router);
  await createRestTranslationUploadRoutes(dependencies, router);
  createRestMetadataRoutes(dependencies, router);
  createRestPaymentRoutes(dependencies, router);
  createRestSyncRoutes(dependencies, router);
  createRestEventRoutes(dependencies, router);
  createRestCouponsRoutes(dependencies, router);

  return router;
};

import { z } from 'zod';

import {
  createGetNow,
  createProcessChangedFiles,
  createProcessDeleteOldEntities,
} from '@sovereign-university/api/content';
import {
  getAllRepoFiles,
  syncCdnRepository,
} from '@sovereign-university/api/github';

import { publicProcedure } from '../../procedures';

// TODO: Protect this endpoint (admin only when we have roles)
export const syncProcedure = publicProcedure
  .meta({ openapi: { method: 'POST', path: '/github/sync' } })
  .input(z.void())
  .output(
    z.object({
      success: z.boolean().optional(),
      errors: z.string().array().optional(),
    }),
  )
  .mutation(async ({ ctx }) => {
    const {
      dependencies: { redis },
    } = ctx;

    const databaseTime = await createGetNow(ctx.dependencies)();

    if (!databaseTime) {
      return { success: false };
    }

    console.log('-- Sync procedure: START');

    const processChangedFiles = createProcessChangedFiles(ctx.dependencies);
    const processDeleteOldEntities = createProcessDeleteOldEntities(
      ctx.dependencies,
    );

    if (!process.env['DATA_REPOSITORY_URL']) {
      throw new Error('DATA_REPOSITORY_URL is not defined');
    }

    await redis.del('trpc:*');

    console.log('-- Sync procedure: Process new repo files');

    const processErrors = await getAllRepoFiles(
      process.env['DATA_REPOSITORY_URL'],
      process.env['DATA_REPOSITORY_BRANCH'],
    ).then(processChangedFiles);

    console.log('-- Sync procedure: sync cdn repository');

    syncCdnRepository(
      '/tmp/sovereign-university-data',
      process.env['CDN_PATH'] || '/tmp/cdn',
    ).catch((error) => {
      console.error(error);
    });

    console.log('-- Sync procedure: Remove old entities');

    if (processErrors.length === 0) {
      await processDeleteOldEntities(databaseTime.now, processErrors);
    }

    console.log('-- Sync procedure: END');

    if (processErrors.length > 0) {
      return { errors: processErrors.map((e) => e) };
    } else {
      return { success: true };
    }
  });

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
      syncErrors: z.string().array().optional(),
      cdnError: z.any().optional(),
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

    const syncErrors = await getAllRepoFiles(
      process.env['DATA_REPOSITORY_URL'],
      process.env['DATA_REPOSITORY_BRANCH'],
    ).then(processChangedFiles);

    console.log('-- Sync procedure: Remove old entities');

    if (syncErrors.length === 0) {
      await processDeleteOldEntities(databaseTime.now, syncErrors);
    }

    await redis.del('trpc:*');

    console.log('-- Sync procedure: sync cdn repository');

    let cdnError;
    syncCdnRepository(
      '/tmp/sovereign-university-data',
      process.env['CDN_PATH'] || '/tmp/cdn',
    ).catch((error) => {
      console.error(error);
      cdnError = error;
    });

    console.log('-- Sync procedure: END');

    if (syncErrors.length > 0) {
      console.error(
        `=== ${syncErrors.length} ERRORS occured during the sync process : `,
      );
      console.error(syncErrors.map((e) => e + '\n'));
    }

    return {
      success: syncErrors.length === 0,
      ...(syncErrors.length > 0 && { syncErrors: syncErrors.map((e) => e) }),
      ...(cdnError != null && { cdnError: cdnError }),
    };
  });

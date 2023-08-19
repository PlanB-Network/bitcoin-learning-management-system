import { z } from 'zod';

import { createProcessChangedFiles } from '@sovereign-academy/content';
import { getAllRepoFiles, syncCdnRepository } from '@sovereign-academy/github';

import { publicProcedure } from '../../procedures';

// TODO: Protect this endpoint (admin only when we have roles)
export const syncProcedure = publicProcedure
  .meta({ openapi: { method: 'POST', path: '/github/sync' } })
  .input(z.void())
  .output(z.void())
  .mutation(async ({ ctx }) => {
    const processChangedFiles = createProcessChangedFiles(ctx.dependencies);

    await getAllRepoFiles(
      'https://github.com/DecouvreBitcoin/sovereign-university-data.git'
    ).then(processChangedFiles);

    syncCdnRepository(
      '/tmp/sovereign-university-data',
      process.env['CDN_PATH'] || '/tmp/cdn'
    ).catch((error) => {
      console.error(error);
    });
  });

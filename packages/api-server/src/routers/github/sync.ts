import { z } from 'zod';

import { createProcessChangedFiles } from '@sovereign-academy/content';
import { createGetAllRepoFiles } from '@sovereign-academy/github';

import { publicProcedure } from '../../trpc';

// TODO: Protect this endpoint (admin only when we have roles)
export const syncProcedure = publicProcedure
  .meta({ openapi: { method: 'POST', path: '/github/sync' } })
  .input(z.void())
  .output(z.void())
  .mutation(async ({ ctx }) => {
    const getAllRepoFiles = createGetAllRepoFiles(ctx.dependencies.octokit);
    const processChangedFiles = createProcessChangedFiles(ctx.dependencies);

    getAllRepoFiles('blc-org/sovereignacademy-data').then(async (files) => {
      processChangedFiles(
        files,
        'https://github.com/blc-org/sovereignacademy-data'
      );
    });

    return;
  });

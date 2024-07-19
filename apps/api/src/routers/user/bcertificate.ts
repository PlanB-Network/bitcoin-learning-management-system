import { z } from 'zod';

import { createGetBCertificateResults } from '@sovereign-university/content';
import { JoinedBCertificateResultsSchema } from '@sovereign-university/schemas';
import type { JoinedBCertificateResults } from '@sovereign-university/types';

import { protectedProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getBCertificateResultsProcedure = protectedProcedure
  .input(z.void())
  .output<Parser<JoinedBCertificateResults[]>>(
    JoinedBCertificateResultsSchema.array(),
  )
  .query(({ ctx }) =>
    createGetBCertificateResults(ctx.dependencies)(ctx.user.uid),
  );

export const userBCertificateRouter = createTRPCRouter({
  getBCertificateResults: getBCertificateResultsProcedure,
});

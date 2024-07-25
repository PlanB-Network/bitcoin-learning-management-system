import { z } from 'zod';

import { createGetBCertificateResults } from '@blms/content';
import { JoinedBCertificateResultsSchema } from '@blms/schemas';
import type { JoinedBCertificateResults } from '@blms/types';

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

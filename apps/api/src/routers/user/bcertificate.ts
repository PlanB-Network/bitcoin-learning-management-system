import { z } from 'zod';

import { JoinedBCertificateResultsSchema } from '@blms/schemas';
import { createGetBCertificateResults } from '@blms/service-content';
import type { JoinedBCertificateResults } from '@blms/types';

import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getBCertificateResultsProcedure = studentProcedure
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

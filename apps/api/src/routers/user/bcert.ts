import { JoinedBCertResultsSchema } from '@blms/schemas';
import { createGetBCertResults } from '@blms/service-content';
import type { JoinedBCertResults } from '@blms/types';
import { z } from 'zod';

import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

const getBCertResultsProcedure = studentProcedure
  .input(z.void())
  .output<Parser<JoinedBCertResults[]>>(JoinedBCertResultsSchema.array())
  .query(({ ctx }) => createGetBCertResults(ctx.dependencies)(ctx.user.uid));

export const userBCertRouter = createTRPCRouter({
  getBCertResults: getBCertResultsProcedure,
});

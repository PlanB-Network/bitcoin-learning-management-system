import { z } from 'zod';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure } from '../../procedures/index.js';
import { createCallbackLnurlAuth } from '../../services/lnurl/auth/callback.js';
import { createGenerateLnurlAuth } from '../../services/lnurl/auth/generate.js';
import { createPollLnurlAuth } from '../../services/lnurl/auth/poll.js';
import { createTRPCRouter } from '../../trpc/index.js';

const lud4GenerateProcedure = publicProcedure
  .input(z.void())
  .output<Parser<{ lnurl: string }>>(
    z.object({
      lnurl: z.string(),
    }),
  )
  .query(({ ctx }) =>
    createGenerateLnurlAuth(ctx.dependencies)({ sessionId: ctx.sessionId }),
  );

const lud4CallbackProcedure = publicProcedure
  .input(
    z.object({
      tag: z.string(),
      k1: z.string(),
      sig: z.string(),
      key: z.string(),
      hmac: z.string(),
    }),
  )
  .output<Parser<{ status: string; reason?: string }>>(
    z.object({
      status: z.string(),
      reason: z.string().optional(),
    }),
  )
  .query(({ ctx, input }) => createCallbackLnurlAuth(ctx.dependencies)(input));

const lud4PollProcedure = publicProcedure
  .input(z.void())
  .output<Parser<{ uid: string }>>(
    z.object({
      uid: z.string(),
    }),
  )
  .query(({ ctx }) =>
    createPollLnurlAuth(ctx.dependencies)({ sessionId: ctx.sessionId }),
  );

export const lud4AuthRouter = createTRPCRouter({
  generate: lud4GenerateProcedure,
  callback: lud4CallbackProcedure,
  poll: lud4PollProcedure,
});

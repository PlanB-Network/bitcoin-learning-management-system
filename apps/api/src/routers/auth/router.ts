import { envConfigEndpointResultSchema } from '@blms/schemas';
import type { EnvConfigEndpointResult } from '@blms/types';
import { z } from 'zod';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure, studentProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

import { credentialsAuthRouter } from './credentials.js';

const logoutProcedure = studentProcedure
  .input(z.void())
  .output<Parser<{ status: number; message: string }>>(
    z.object({
      message: z.string(),
      status: z.number(),
    }),
  )
  .mutation(async ({ ctx: { req } }) => {
    return new Promise((resolve) => {
      req.session.destroy((error) => {
        if (error) {
          req.log('Error destroying session:', error);
        }

        resolve({
          message: 'Logged out successfully',
          status: 200,
        });
      });
    });
  });

const configProcedure = publicProcedure
  .input(z.void())
  .output<Parser<EnvConfigEndpointResult>>(envConfigEndpointResultSchema)
  .query(({ ctx }) => {
    return {
      stripePublicKey: ctx.dependencies.config.stripe.publicKey,
    };
  });

export const authRouter = createTRPCRouter({
  config: configProcedure,
  credentials: credentialsAuthRouter,
  logout: logoutProcedure,
});

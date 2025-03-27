import { z } from 'zod';

import { envConfigEndpointResultSchema } from '@blms/schemas';
import type { EnvConfigEndpointResult } from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { publicProcedure, studentProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

import { credentialsAuthRouter } from './credentials.js';

const logoutProcedure = studentProcedure
  .input(z.void())
  .output<Parser<{ status: number; message: string }>>(
    z.object({
      status: z.number(),
      message: z.string(),
    }),
  )
  .mutation(async ({ ctx }) => {
    const { req } = ctx;

    return new Promise((resolve) => {
      req.session.destroy((error) => {
        if (error) {
          console.error(error);
        }

        resolve({
          status: 200,
          message: 'Logged out successfully',
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
  credentials: credentialsAuthRouter,
  logout: logoutProcedure,
  config: configProcedure,
});

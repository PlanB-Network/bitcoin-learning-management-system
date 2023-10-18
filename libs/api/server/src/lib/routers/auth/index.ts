import { z } from 'zod';

import { protectedProcedure } from '../../procedures';
import { createTRPCRouter } from '../../trpc';

import { credentialsAuthRouter } from './credentials';
import { lud4AuthRouter } from './lud4';

const logoutProcedure = protectedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/auth/logout',
    },
  })
  .input(z.void())
  .output(
    z.object({
      status: z.number(),
      message: z.string(),
    }),
  )
  .mutation(async ({ ctx }) => {
    const { req } = ctx;

    return new Promise((resolve) => {
      req.session.regenerate((error) => {
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

export const authRouter = createTRPCRouter({
  credentials: credentialsAuthRouter,
  lud4: lud4AuthRouter,
  logout: logoutProcedure,
});

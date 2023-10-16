import { z } from 'zod';

import { protectedProcedure } from '../../procedures';
import { createTRPCRouter } from '../../trpc';

import { credentialsAuthRouter } from './credentials';
import { LUD4AuthRouter } from './lud4';

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

    console.log(req.session);
    if (req.session) {
      req.session.destroy((error) => {
        if (error) {
          console.error(error);
        }
      });
    }

    return {
      status: 200,
      message: 'Logged out successfully',
    };
  });

export const authRouter = createTRPCRouter({
  credentials: credentialsAuthRouter,
  lud4: LUD4AuthRouter,
  logout: logoutProcedure,
});

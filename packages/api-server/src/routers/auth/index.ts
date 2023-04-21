import { createTRPCRouter, publicProcedure } from '../../trpc';

import { credentialsAuthRouter } from './credentials';
import { LUD4AuthRouter } from './lud4';

export const authRouter = createTRPCRouter({
  credentials: credentialsAuthRouter,
  lud4: LUD4AuthRouter,
  logout: publicProcedure.mutation(({ ctx }) => {
    if (ctx.session) {
      ctx.session.destroy();
    }

    return { isLoggedIn: false };
  }),
});

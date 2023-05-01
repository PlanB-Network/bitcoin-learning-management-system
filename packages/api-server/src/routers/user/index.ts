import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { signAccessToken } from '../../utils/access-token';

export const userRouter = createTRPCRouter({
  getMe: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      accessToken: signAccessToken(ctx.user),
      isLoggedIn: true,
    };
  }),
});

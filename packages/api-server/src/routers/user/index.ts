import { createTRPCRouter, publicProcedure } from '../../trpc';

export const userRouter = createTRPCRouter({
  getUser: publicProcedure.query(({ ctx }) => {
    if (ctx.session?.user) {
      return {
        username: ctx.session.user.username,
        isLoggedIn: true,
      };
    }

    return {
      username: null,
      isLoggedIn: false,
    };
  }),
});

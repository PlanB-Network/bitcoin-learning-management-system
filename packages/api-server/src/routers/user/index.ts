import { protectedProcedure } from '../../procedures';
import { createTRPCRouter } from '../../trpc';
import { signAccessToken } from '../../utils/access-token';

import { userCoursesRouter } from './courses';

export const userRouter = createTRPCRouter({
  getMe: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      accessToken: signAccessToken(ctx.user.uid),
      isLoggedIn: true,
    };
  }),
  courses: userCoursesRouter,
});

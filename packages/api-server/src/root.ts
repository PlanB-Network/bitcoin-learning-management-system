import { authRouter } from './routers/auth';
import { githubRouter } from './routers/github';
import { userRouter } from './routers/user';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  github: githubRouter,
});

// Export type definition of the API
export type AppRouter = typeof appRouter;

import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
});

// Export type definition of the API
export type AppRouter = typeof appRouter;

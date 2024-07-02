import { createTRPCRouter } from '../trpc/index.js';

import { authRouter } from './auth/router.js';
import { contentRouter } from './content/router.js';
// import { githubRouter } from './github/router.js';
import { userRouter } from './user/router.js';

export const trpcRouter = createTRPCRouter({
  auth: authRouter,
  content: contentRouter,
  user: userRouter,
  // github: githubRouter,
});

// Export type definition of the API
// https://trpc.io/docs/server/routers#defining-a-router
// https://github.com/trpc/trpc/discussions/2448
export type TrpcRouter = typeof trpcRouter;

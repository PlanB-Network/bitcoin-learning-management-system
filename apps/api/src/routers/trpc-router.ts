import { createTRPCRouter } from '../trpc/index.js';

import { authRouter } from './auth/router.js';
import { contentRouter } from './content/router.js';
// import { githubRouter } from './github/router.js';
import { userRouter } from './user/router.js';

export const trpcRouter = createTRPCRouter({
  auth: authRouter,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  content: contentRouter,
  user: userRouter,
  // github: githubRouter,
});

// Export type definition of the API
export type TrpcRouter = typeof trpcRouter;

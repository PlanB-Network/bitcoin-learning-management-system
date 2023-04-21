import { createTRPCRouter } from '../../trpc';

import { webhooksProcedure } from './webhooks';

export const githubRouter = createTRPCRouter({
  webhooks: webhooksProcedure,
});

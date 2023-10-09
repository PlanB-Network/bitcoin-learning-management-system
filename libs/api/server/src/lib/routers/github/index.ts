import { createTRPCRouter } from '../../trpc';

import { syncProcedure } from './sync';
import { webhooksProcedure } from './webhooks';

export const githubRouter = createTRPCRouter({
  webhooks: webhooksProcedure,
  sync: syncProcedure,
});

import { createTRPCRouter } from '../../trpc/index.js';

import { syncProcedure } from './sync.js';
import { webhooksProcedure } from './webhooks.js';

export const githubRouter = createTRPCRouter({
  webhooks: webhooksProcedure,
  sync: syncProcedure,
});

import { mergeTRPCRouters } from '../../trpc';

import { resourcesRouter } from './resources';

export const contentRouter = mergeTRPCRouters(resourcesRouter);

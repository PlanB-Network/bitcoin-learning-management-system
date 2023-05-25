import { mergeTRPCRouters } from '../../trpc';

import { coursesRouter } from './courses';
import { resourcesRouter } from './resources';

export const contentRouter = mergeTRPCRouters(coursesRouter, resourcesRouter);

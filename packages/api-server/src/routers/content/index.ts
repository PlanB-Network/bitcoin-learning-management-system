import { mergeTRPCRouters } from '../../trpc';

import { coursesRouter } from './courses';
import { resourcesRouter } from './resources';
import { tutorialsRouter } from './tutorials';

export const contentRouter = mergeTRPCRouters(
  coursesRouter,
  resourcesRouter,
  tutorialsRouter
);

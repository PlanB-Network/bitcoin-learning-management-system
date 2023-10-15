import { mergeTRPCRouters } from '../../trpc';

import { coursesRouter } from './courses';
import { professorsRouter } from './professors';
import { resourcesRouter } from './resources';
import { tutorialsRouter } from './tutorials';

export const contentRouter = mergeTRPCRouters(
  coursesRouter,
  professorsRouter,
  resourcesRouter,
  tutorialsRouter,
);

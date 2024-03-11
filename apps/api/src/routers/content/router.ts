import { mergeTRPCRouters } from '../../trpc/index.js';

import { coursesRouter } from './courses.js';
import { eventsRouter } from './events.js';
import { professorsRouter } from './professors.js';
import { resourcesRouter } from './resources.js';
import { tutorialsRouter } from './tutorials.js';

export const contentRouter = mergeTRPCRouters(
  coursesRouter,
  eventsRouter,
  professorsRouter,
  resourcesRouter,
  tutorialsRouter,
);

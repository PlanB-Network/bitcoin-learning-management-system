import { mergeTRPCRouters } from '../../trpc/index.js';

import { couponRouter } from './coupon.js';
import { coursesRouter } from './courses.js';
import { eventLocationRouter } from './event-location.js';
import { eventsRouter } from './events.js';
import { professorsRouter } from './professors.js';
import { resourcesRouter } from './resources.js';
import { tutorialsRouter } from './tutorials.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const contentRouter = mergeTRPCRouters(
  couponRouter,
  coursesRouter,
  eventsRouter,
  eventLocationRouter,
  professorsRouter,
  resourcesRouter,
  tutorialsRouter,
);

import { mergeTRPCRouters } from '../../trpc/index.js';

import { blogsRouter } from './blogs.js';
import { couponRouter } from './coupon.js';
import { coursesRouter } from './courses.js';
import { eventLocationRouter } from './event-location.js';
import { eventsRouter } from './events.js';
import { professorsRouter } from './professors.js';
import { proofreadingsRouter } from './proofreadings.js';
import { resourcesRouter } from './resources.js';
import { tutorialsRouter } from './tutorials.js';

export const contentRouter = mergeTRPCRouters(
  couponRouter,
  coursesRouter,
  eventsRouter,
  eventLocationRouter,
  professorsRouter,
  resourcesRouter,
  tutorialsRouter,
  blogsRouter,
  proofreadingsRouter,
);

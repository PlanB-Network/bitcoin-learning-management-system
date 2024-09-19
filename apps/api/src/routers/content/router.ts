import { mergeTRPCRouters } from '../../trpc/index.js';

import { blogsRouter } from './blogs.js';
import { builderLocationRouter } from './builder-location.js';
import { couponRouter } from './coupon.js';
import { coursesRouter } from './courses.js';
import { eventLocationRouter } from './event-location.js';
import { eventsRouter } from './events.js';
import { legalsRouter } from './legals.js';
import { professorsRouter } from './professors.js';
import { proofreadingsRouter } from './proofreadings.js';
import { resourcesRouter } from './resources.js';
import { tutorialsRouter } from './tutorials.js';

export const contentRouter = mergeTRPCRouters(
  couponRouter,
  coursesRouter,
  eventsRouter,
  eventLocationRouter,
  builderLocationRouter,
  professorsRouter,
  resourcesRouter,
  tutorialsRouter,
  blogsRouter,
  proofreadingsRouter,
  legalsRouter,
);

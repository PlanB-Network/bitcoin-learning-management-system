import { mergeTRPCRouters } from '../../trpc/index.js';

import { blogsRouter } from './blogs.js';
import { couponRouter } from './coupon.js';
import { coursesRouter } from './courses.js';
import { eventLocationRouter } from './event-location.js';
import { eventsRouter } from './events.js';
import { labsRouter } from './labs.js';
import { legalsRouter } from './legals.js';
import { professorsRouter } from './professors.js';
import { projectLocationRouter } from './project-location.js';
import { proofreadingsRouter } from './proofreadings.js';
import { resourcesRouter } from './resources.js';
import { tutorialsRouter } from './tutorials.js';
import { videosRouter } from './videos.js';

export const contentRouter = mergeTRPCRouters(
  couponRouter,
  coursesRouter,
  eventsRouter,
  eventLocationRouter,
  projectLocationRouter,
  professorsRouter,
  resourcesRouter,
  tutorialsRouter,
  blogsRouter,
  proofreadingsRouter,
  legalsRouter,
  labsRouter,
  videosRouter,
);

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
import { translationsRouter } from './translations.js';
import { tutorialsRouter } from './tutorials.js';
import { videosRouter } from './videos.js';

// Create the content router by merging all sub-routers
export const contentRouter = mergeTRPCRouters(
  blogsRouter,
  couponRouter,
  coursesRouter,
  eventLocationRouter,
  eventsRouter,
  labsRouter,
  legalsRouter,
  professorsRouter,
  projectLocationRouter,
  proofreadingsRouter,
  resourcesRouter,
  translationsRouter,
  tutorialsRouter,
  videosRouter,
);

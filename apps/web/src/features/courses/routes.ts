import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { CourseDetails } from './pages/details.tsx';
import { CoursesExplorer } from './pages/explorer.tsx';

const coursesRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'courses',
});

export const coursesIndexRoute = createRoute({
  getParentRoute: () => coursesRootRoute,
  path: '/',
  component: CoursesExplorer,
});

export const coursesDetailsRoute = createRoute({
  getParentRoute: () => coursesRootRoute,
  path: '/$courseId',
  component: CourseDetails,
});

export const coursesChapterRoute = createRoute({
  getParentRoute: () => coursesRootRoute,
  path: '/$courseId/$chapterId',
  component: lazyRouteComponent(
    () => import('./pages/chapter.tsx'),
    'CourseChapter',
  ),
});

export const coursesRoutes = coursesRootRoute.addChildren([
  coursesIndexRoute,
  coursesDetailsRoute,
  coursesChapterRoute,
]);

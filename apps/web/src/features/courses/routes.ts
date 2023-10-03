import { Route } from '@tanstack/router';
import { rootRoute } from '../../routes/root';

const coursesRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'courses',
});

export const coursesIndexRoute = new Route({
  getParentRoute: () => coursesRootRoute,
  path: '/',
});

export const coursesDetailsRoute = new Route({
  getParentRoute: () => coursesRootRoute,
  path: '/$courseId',
});

export const coursesChapterRoute = new Route({
  getParentRoute: () => coursesDetailsRoute,
  path: '/chapter/$chapterId',
});

export const coursesRoutes = coursesRootRoute.addChildren([
  coursesIndexRoute,
  coursesDetailsRoute,
  coursesChapterRoute,
]);

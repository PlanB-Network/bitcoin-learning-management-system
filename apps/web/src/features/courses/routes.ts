import { Route } from '@tanstack/react-router';
import { rootRoute } from '../../routes/root';
import { CoursesExplorer } from './pages/explorer';

const coursesRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'courses',
});

export const coursesIndexRoute = new Route({
  getParentRoute: () => coursesRootRoute,
  path: '/',
  component: CoursesExplorer
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

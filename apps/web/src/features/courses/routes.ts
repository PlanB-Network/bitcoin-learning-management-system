import { Route } from '@tanstack/react-router';
import { rootRoute } from '../../routes/root';
import { CoursesExplorer } from './pages/explorer';
import { CourseDetails } from './pages/details';
import { CourseChapter } from './pages/chapter';

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
  component: CourseDetails
});

export const coursesChapterRoute = new Route({
  getParentRoute: () => coursesDetailsRoute,
  path: '/chapter/$chapterId',
  component: CourseChapter
});

export const coursesRoutes = coursesRootRoute.addChildren([
  coursesIndexRoute,
  coursesDetailsRoute,
  coursesChapterRoute,
]);

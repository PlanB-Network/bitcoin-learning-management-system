import { Route } from '@tanstack/react-router';
import { rootRoute } from '../../routes/root';
import { CourseChapter } from './pages/chapter';
import { CourseDetails } from './pages/details';
import { CoursesExplorer } from './pages/explorer';

const coursesRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'courses',
});

export const coursesIndexRoute = new Route({
  getParentRoute: () => coursesRootRoute,
  path: '/',
  component: CoursesExplorer
})

export const coursesDetailsRoute = new Route({
  getParentRoute: () => coursesRootRoute,
  path: '/$courseId',
  component: CourseDetails
})

export const coursesChapterRoute = new Route({
  getParentRoute: () => coursesRootRoute,
  path: '/$courseId/$chapterIndex',
  component: CourseChapter
})

export const coursesRoutes = coursesRootRoute.addChildren([
  coursesIndexRoute,
  coursesDetailsRoute,
  coursesChapterRoute,
]);

import { Route } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root';

import { DashboardCourse } from './pages/dashboard-course';
import { DashboardCourses } from './pages/dashboard-courses';
import { DashboardProfile } from './pages/dashboard-profile';

const dashboardRootRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
});

export const dashboardIndexRoute = new Route({
  getParentRoute: () => dashboardRootRoute,
  path: '/',
  component: DashboardCourses,
});

export const dashboardProfileRoute = new Route({
  getParentRoute: () => dashboardRootRoute,
  path: '/profile',
  component: DashboardProfile,
});

export const dashboardCoursesRoute = new Route({
  getParentRoute: () => dashboardRootRoute,
  path: '/courses',
  component: DashboardCourses,
});

export const dashboardCourseDetailsRoute = new Route({
  getParentRoute: () => dashboardRootRoute,
  path: '/course/$courseId',
  component: DashboardCourse,
});

export const dashboardRoutes = dashboardRootRoute.addChildren([
  dashboardIndexRoute,
  dashboardCoursesRoute,
  dashboardProfileRoute,
  dashboardCourseDetailsRoute,
]);

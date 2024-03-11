import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { DashboardCourse } from './pages/dashboard-course.tsx';
import { DashboardCourses } from './pages/dashboard-courses.tsx';
import { DashboardProfile } from './pages/dashboard-profile.tsx';

const dashboardRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
});

export const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRootRoute,
  path: '/',
  component: DashboardCourses,
});

export const dashboardProfileRoute = createRoute({
  getParentRoute: () => dashboardRootRoute,
  path: '/profile',
  component: DashboardProfile,
});

export const dashboardCoursesRoute = createRoute({
  getParentRoute: () => dashboardRootRoute,
  path: '/courses',
  component: DashboardCourses,
});

export const dashboardCourseDetailsRoute = createRoute({
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

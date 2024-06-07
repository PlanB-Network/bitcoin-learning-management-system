import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../../routes/root.tsx';

import { DashboardBookings } from './pages/dashboard-bookings.tsx';
import { DashboardCalendar } from './pages/dashboard-calendar.tsx';
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

export const dashboardBookingsRoute = createRoute({
  getParentRoute: () => dashboardRootRoute,
  path: '/bookings',
  component: DashboardBookings,
});

export const dashboardCalendarRoute = createRoute({
  getParentRoute: () => dashboardRootRoute,
  path: '/calendar',
  component: DashboardCalendar,
});

export const dashboardCoursesRoute = createRoute({
  getParentRoute: () => dashboardRootRoute,
  path: '/courses',
  component: DashboardCourses,
});

export const dashboardProfileRoute = createRoute({
  getParentRoute: () => dashboardRootRoute,
  path: '/profile',
  component: DashboardProfile,
});

export const dashboardRoutes = dashboardRootRoute.addChildren([
  dashboardIndexRoute,
  dashboardBookingsRoute,
  dashboardCalendarRoute,
  dashboardCoursesRoute,
  dashboardProfileRoute,
]);

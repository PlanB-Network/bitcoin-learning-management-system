import { Route, redirect } from '@tanstack/router';
import { rootRoute } from './root';
import { router } from '.';

export const authenticatedRoute = new Route({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: async () => {
    // TODO: replace with real auth check
    const isAuthenticated = () => true;

    if (!isAuthenticated()) {
      throw redirect({
        to: '/',
        search: {
          redirect: router.state.location.href,
        },
      });
    }
  },
});

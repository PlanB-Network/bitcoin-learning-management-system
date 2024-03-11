import { createRoute, redirect } from '@tanstack/react-router';

import { router } from './index.tsx';
import { rootRoute } from './root.tsx';

export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: () => {
    // TODO: replace with real auth check
    // eslint-disable-next-line unicorn/consistent-function-scoping
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

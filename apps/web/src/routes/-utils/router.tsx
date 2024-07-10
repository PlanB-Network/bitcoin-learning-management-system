import { createRouter } from '@tanstack/react-router';

import { routeTree } from '#src/routeTree.gen.js';

export const router = createRouter({
  routeTree,
  defaultPreload: false,
  context: {
    i18n: undefined,
  },
  unmaskOnReload: true,
});

// https://tanstack.com/router/latest/docs/framework/react/decisions-on-dx#2-declaring-the-router-instance-for-type-inference
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

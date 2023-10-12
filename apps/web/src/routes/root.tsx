import { Outlet, RootRoute, ScrollRestoration } from '@tanstack/react-router';

// eslint-disable-next-line react-refresh/only-export-components
const Root = () => {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
};

// Create a root route
export const rootRoute = new RootRoute({
  component: Root,
});

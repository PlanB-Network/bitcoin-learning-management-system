import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { i18n } from 'i18next';

const Root = () => {
  // Uncomment for dev tools in development mode
  // const TanStackRouterDevtools =
  //   process.env.NODE_ENV === 'production'
  //     ? () => null // Render nothing in production
  //     : React.lazy(() =>
  //         // Lazy load in development
  //         import('@tanstack/router-devtools').then((res) => ({
  //           default: res.TanStackRouterDevtools,
  //         })),
  //       );

  return (
    <>
      <Outlet />
      {/* <Suspense>
        <TanStackRouterDevtools />
      </Suspense> */}
    </>
  );
};

// Create a root route with context for i18n support
export const Route = createRootRouteWithContext<{
  i18n?: i18n;
}>()({
  component: Root,
  errorComponent: function ErrorComp({ error }) {
    return (
      <div className="flex flex-col p-4 text-white">
        <span className="mt-6">An error occurred: {error.message} </span>
        <a className="text-orange-500" href="/">
          Go back Home
        </a>
      </div>
    );
  },
});

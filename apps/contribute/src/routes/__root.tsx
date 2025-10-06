import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { i18n } from 'i18next';

// Create a root route with context for i18n support
export const Route = createRootRouteWithContext<{
  i18n?: i18n;
}>()({
  component: () => (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  ),
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

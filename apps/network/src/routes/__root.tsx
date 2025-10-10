import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { PageLayout } from '#src/components/page-layout.tsx';

export const Route = createRootRoute({
  component: () => (
    <>
      <PageLayout>
        <Outlet />
      </PageLayout>

      {process.env.NODE_ENV === 'development' ? (
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
      ) : null}
    </>
  ),
});

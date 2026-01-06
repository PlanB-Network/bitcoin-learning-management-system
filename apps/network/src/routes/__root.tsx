import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, Outlet, useMatches } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { PageLayout } from '#src/components/page-layout.tsx';

export const Route = createRootRoute({
  component: () => {
    const matches = useMatches();
    const lastMatchWithVariant = [...matches]
      .reverse()
      .find(
        (match) => match.staticData && (match.staticData as any).layoutVariant,
      );

    const variant =
      (lastMatchWithVariant?.staticData as any)?.layoutVariant || 'dark';

    return (
      <>
        <PageLayout variant={variant}>
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
    );
  },
});

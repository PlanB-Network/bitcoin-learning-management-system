import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.js';
import { AppContext } from '#src/providers/context.tsx';
import { trpc } from '#src/utils/trpc.js';
import { EventsGrid } from './-components/events-grid.tsx';

const EventsMap = lazy(
  () => import('#src/routes/$lang/_content/events/-components/events-map.tsx'),
);

export const Route = createFileRoute('/$lang/_content/events/')({
  component: Events,
});

function Events() {
  const { t } = useTranslation();

  const { session } = useContext(AppContext);
  const isLoggedIn = !!session?.user;

  const queryOpts = {
    refetchOnMount: false, // 10 minutes
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 600_000,
  };

  const { data: events, isFetched } = useQuery(
    trpc.content.getRecentEvents.queryOptions(undefined, queryOpts),
  );

  return (
    <PageLayout
      title={t('words.events')}
      actionButtons={[
        {
          text: t('events.addEvent'),
          href: '/tutorials/contribution/resource/add-event-1d3df554-c2d8-4e93-853f-58f672c5e097',
        },
      ]}
      tabs={
        isLoggedIn
          ? [
              { id: 'events', label: t('words.events'), href: '/events' },
              {
                id: 'my-tickets',
                label: t('events.myTickets'),
                href: '/events/my-tickets',
              },
            ]
          : []
      }
    >
      {!isFetched && <Loader size={'s'} />}
      {events && (
        <>
          <Suspense fallback={<Loader size={'s'} />}>
            <EventsMap events={events} />
          </Suspense>

          <EventsGrid events={events} />
        </>
      )}
    </PageLayout>
  );
}

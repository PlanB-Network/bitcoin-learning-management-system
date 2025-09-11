import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.js';
import { trpc } from '#src/utils/trpc.js';
import { EventsGrid } from './-components/events-grid.tsx';

export const Route = createFileRoute('/$lang/_content/events/plan-b-week')({
  component: PlanBWeek,
});

const EventsMap = lazy(
  () => import('#src/routes/$lang/_content/events/-components/events-map.tsx'),
);

function PlanBWeek() {
  const { t } = useTranslation();

  const queryOpts = {
    refetchOnMount: false, // 10 minutes
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 600_000,
  };

  const { data: events, isFetched } = useQuery(
    trpc.content.getRecentEvents.queryOptions(undefined, queryOpts),
  );

  const filteredEvents = events?.filter((event) =>
    event.addressLine1?.toLowerCase().includes('lugano'),
  );

  return (
    <PageLayout>
      <div className="max-w-[1440px] w-full flex flex-col gap-6 px-3 pt-2.5 mx-auto md:gap-7 md:px-10">
        {!isFetched && <Loader size={'s'} />}
        {filteredEvents && (
          <>
            <h1 className="display-small-32px lg:display-large text-white text-center">
              {t('events.planBWeek.pageTitle')}
            </h1>
            <Suspense fallback={<Loader size={'s'} />}>
              <EventsMap
                events={filteredEvents}
                showMap={false}
                fixedCalendarDate={'2025-10-22'}
              />
            </Suspense>

            <EventsGrid events={filteredEvents} hideTitle={true} />
          </>
        )}
      </div>
    </PageLayout>
  );
}

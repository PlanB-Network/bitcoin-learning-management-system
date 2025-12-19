import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';
import { BookingPart } from './-components/booking-part.tsx';

export const Route = createFileRoute('/$lang/events/my-tickets')({
  component: DashboardBookings,
});

function DashboardBookings() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);

  const { data: tickets, refetch: refetchTickets } = useQuery({
    ...trpc.user.billing.getTickets.queryOptions(),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const now = new Date();

  const pastTickets = tickets
    ? tickets.filter((ticket) => ticket.date < now)
    : [];
  const upcomingTickets = tickets
    ? tickets.filter((ticket) => ticket.date >= now)
    : [];

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/events' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      layoutSize="max"
      title={t('events.myTickets')}
      tabs={[
        { id: 'events', label: t('words.events'), href: '/events' },
        {
          id: 'my-tickets',
          label: t('events.myTickets'),
          href: '/events/my-tickets',
        },
      ]}
    >
      {tickets && (
        <>
          <h2 className="title-large text-black mb-4">
            {t('dashboard.booking.upcomingTicketTitle')}
          </h2>
          <div className="w-full flex flex-col gap-4 text-neutral-700 mb-10">
            <BookingPart
              tickets={upcomingTickets}
              refetchTickets={refetchTickets}
            />
          </div>

          <h2 className="title-large text-black mb-4">
            {t('dashboard.booking.pastTicketTitle')}
          </h2>
          <div className="w-full flex flex-col gap-4 text-neutral-700">
            <BookingPart tickets={pastTickets} />
          </div>
        </>
      )}
    </PageLayout>
  );
}

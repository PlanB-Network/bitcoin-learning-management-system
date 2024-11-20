import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { TextTag } from '@blms/ui';

import { AppContext } from '#src/providers/context.tsx';

import BookingTable from '../-components/booking-table.tsx';

export const Route = createFileRoute(
  '/dashboard/_dashboard/administration/bookings',
)({
  component: AdminBookings,
});

function AdminBookings() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  } else if (
    session?.user.role !== 'admin' &&
    session?.user.role !== 'superadmin'
  ) {
    navigate({ to: '/dashboard/courses' });
  }

  return (
    <section className="flex flex-col gap-4 lg:gap-8">
      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5 mb-5 md:mb-11">
          <span className="text-dashboardSectionText text-s text-2xl md:display-small-32px">
            {t('dashboard.adminPanel.bookingsPanel')}
          </span>
          <TextTag size={'small'} className="uppercase max-w-[60px]">
            {t('words.admin')}
          </TextTag>
        </div>
        <span className="text-2xl mb-2.5 md:mb-4">
          {t('dashboard.adminPanel.upcomingBookings')}
        </span>
        <span className="text-newBlack-5">
          {t('dashboard.adminPanel.upcomingBookingsSubtitle')}
        </span>
      </div>

      <BookingTable />
    </section>
  );
}

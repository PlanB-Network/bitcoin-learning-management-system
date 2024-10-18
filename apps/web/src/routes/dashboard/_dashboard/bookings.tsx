import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsContent } from '@blms/ui';

import { TabsListUnderlined } from '#src/components/Tabs/TabsListUnderlined.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

import { BillingSection } from './-components/billing-section.tsx';
import { BookingPart } from './-components/booking-part.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/bookings')({
  component: DashboardBookings,
});

function DashboardBookings() {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  const [currentTab, setCurrentTab] = useState('tickets');

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  const { data: invoices } = trpc.user.billing.getInvoices.useQuery({
    language: i18n.language ?? 'en',
  });
  const { data: tickets } = trpc.user.billing.getTickets.useQuery();

  if (!tickets) return null;

  const now = new Date();

  const pastTickets = tickets.filter((ticket) => ticket.date < now);
  const upcomingTickets = tickets.filter((ticket) => ticket.date >= now);

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="text-2xl">{t('words.bookings')}</div>
      <Tabs
        defaultValue="tickets"
        value={currentTab}
        onValueChange={onTabChange}
        className="max-w-[1100px]"
      >
        <TabsListUnderlined
          tabs={[
            {
              key: 'tickets',
              value: 'tickets',
              text: t('words.tickets'),
              active: 'tickets' === currentTab,
            },
            {
              key: 'billings',
              value: 'billings',
              text: t('words.billing'),
              active: 'billings' === currentTab,
            },
          ]}
        />
        <TabsContent value="tickets">
          {tickets && (
            <div className="pt-2 md:pt-8">
              <p className="desktop-h6 !font-medium text-darkOrange-5">
                {t('dashboard.booking.upcomingTicketTitle')}
              </p>
              <p className="desktop-subtitle1 text-newBlack-4 my-4">
                {t('dashboard.booking.upcomingTicketSubtitle')}
              </p>
              <div className="w-full flex flex-col gap-4 text-newBlack-4">
                <BookingPart tickets={upcomingTickets} />
              </div>

              <hr className="my-10 border-newGray-4" />

              <p className="desktop-h6 !font-medium text-darkOrange-5">
                {t('dashboard.booking.pastTicketTitle')}
              </p>
              <div className="w-full flex flex-col gap-4 text-newBlack-4">
                <BookingPart tickets={pastTickets} />
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="billings">
          {invoices && <BillingSection invoices={invoices} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@sovereign-university/ui';

import { formatDate } from '#src/utils/date.js';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../atoms/Tabs/index.tsx';
import { trpc } from '../../../utils/index.ts';
import { BillingSection } from '../components/billing-section.tsx';
import { BookingPart } from '../components/booking-part.tsx';
import { DashboardLayout } from '../layout.tsx';

export const DashboardBookings = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { data: session } = trpc.user.getSession.useQuery();
  if (!session) {
    navigate({ to: '/' });
  }

  const { data: invoices } = trpc.user.billing.getInvoices.useQuery();
  const { data: tickets } = trpc.user.billing.getTickets.useQuery();

  if (!tickets) return null;

  const now = new Date();

  const pastTickets = tickets.filter((ticket) => new Date(ticket.date) < now);
  const upcomingTickets = tickets.filter(
    (ticket) => new Date(ticket.date) >= now,
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="text-2xl">{t('dashboard.bookings')}</div>
        <Tabs defaultValue="tickets" className="max-w-[1100px]">
          <TabsList>
            <TabsTrigger
              value="tickets"
              className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black"
            >
              {t('words.tickets')}
            </TabsTrigger>
            <TabsTrigger
              value="billings"
              className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black"
            >
              {t('words.billing')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tickets">
            {tickets && (
              <div className="pt-8">
                <p className="desktop-h6 text-darkOrange-5">
                  {t('dashboard.booking.upcomingTicketTitle')}
                </p>
                <p className="desktop-subtitle1 text-newBlack-4 my-4">
                  {t('dashboard.booking.upcomingTicketSubtitle')}
                </p>
                <div className="w-full flex flex-col gap-4 text-newBlack-4">
                  <BookingPart tickets={upcomingTickets} />
                </div>

                <hr className="my-10 border-newGray-4" />

                <p className="desktop-h6 text-darkOrange-5">
                  {t('dashboard.booking.pastTicketTitle')}
                </p>
                <div className="w-full flex flex-col gap-4 text-newBlack-4">
                  <BookingPart tickets={pastTickets} />
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="billings">
            <BillingSection invoices={invoices} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

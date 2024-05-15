import { useTranslation } from 'react-i18next';

import { Button } from '@sovereign-university/ui';

import { Card } from '#src/atoms/Card/index.js';
import { formatDate } from '#src/utils/date.js';
import type { TRPCRouterOutput } from '#src/utils/trpc.js';

export const BookingPart = ({
  tickets,
}: {
  tickets: NonNullable<TRPCRouterOutput['user']['billing']['getTickets']>;
}) => {
  const { t } = useTranslation();

  return (
    <>
      {tickets.length > 0 ? (
        <>
          <div className="hidden md:flex flex-row gap-4 font-medium text-newBlack-1 my-4">
            <span className="w-[150px] flex-none">
              {t('dashboard.booking.ticketDate')}
            </span>
            <span className="w-[150px] flex-none capitalize">
              {t('dashboard.booking.ticketLocation')}
            </span>
            <span className="w-[100px] flex-none capitalize">
              {t('dashboard.booking.ticketType')}
            </span>
            <span className="min-w-[100px] grow">
              {t('dashboard.booking.ticketTitle')}
            </span>
            <span className="w-[100px] flex-none ml-auto">
              {t('words.ticket')}
            </span>
          </div>
          {tickets.map((ticket, index) => {
            const location = ticket.isInPerson
              ? ticket.location
              : t('words.online');
            return (
              <div key={index}>
                <div className="hidden md:flex flex-row gap-4">
                  <span className="w-[150px] flex-none">
                    {formatDate(new Date(ticket.date))}
                  </span>
                  <span className="w-[150px] flex-none capitalize">
                    {location}
                  </span>
                  <span className="w-[100px] flex-none capitalize">
                    {ticket.type}
                  </span>
                  <div className="min-w-[100px] grow h-fit">
                    <span className="w-fit bg-newGray-5 pl-4 pr-2 py-1 rounded-full text-black font-medium">
                      {ticket.title}
                    </span>
                  </div>
                  <span className="w-[100px] flex-none ml-auto">
                    <Button variant="newPrimary" size="s" mode="light" disabled>
                      {t('words.download')}
                    </Button>
                  </span>
                </div>

                <Card withPadding={false} className="flex md:hidden p-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-newBlack-1 font-medium">
                      {ticket.title}
                    </span>
                    <span className="flex-none  text-sm">
                      {formatDate(new Date(ticket.date))} - {location}
                    </span>
                    <span className="">
                      <Button variant="newPrimary" size="xs" disabled>
                        {t('dashboard.booking.downloadTicket')}
                      </Button>
                    </span>
                  </div>
                </Card>
              </div>
            );
          })}
        </>
      ) : (
        <p>{t('dashboard.booking.noInvoice')}</p>
      )}
    </>
  );
};

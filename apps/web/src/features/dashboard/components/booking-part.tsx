import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FiLoader } from 'react-icons/fi';

import { Button } from '@sovereign-university/ui';

import { Card } from '#src/atoms/Card/index.js';
import { formatDate } from '#src/utils/date.js';
import { type TRPCRouterOutput, trpc } from '#src/utils/trpc.js';

export const BookingPart = ({
  tickets,
}: {
  tickets: NonNullable<TRPCRouterOutput['user']['billing']['getTickets']>;
}) => {
  const { t } = useTranslation();

  const { data: user } = trpc.user.getDetails.useQuery();

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
            <span className="w-[150px] flex-none ml-auto">
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
                  <Buttons
                    ticket={ticket}
                    userDisplayName={user?.displayName as string}
                    buttonSize="m"
                  />
                </div>

                <Card withPadding={false} className="flex md:hidden p-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-newBlack-1 font-medium">
                      {ticket.title}
                    </span>
                    <span className="flex-none  text-sm">
                      {formatDate(new Date(ticket.date))} - {location}
                    </span>
                    <Buttons
                      ticket={ticket}
                      userDisplayName={user?.displayName as string}
                      buttonSize="s"
                    />
                  </div>
                </Card>
              </div>
            );
          })}
        </>
      ) : (
        <p className="mt-4">{t('dashboard.booking.noTicket')}</p>
      )}
    </>
  );
};

const Buttons = ({
  ticket,
  userDisplayName,
  buttonSize,
}: {
  ticket: NonNullable<
    TRPCRouterOutput['user']['billing']['getTickets'][number]
  >;
  userDisplayName: string;
  buttonSize: 's' | 'm';
}) => {
  const { t } = useTranslation();

  const { mutateAsync: downloadTicketAsync, isPending } =
    trpc.user.events.downloadEventTicket.useMutation();

  return (
    <div className="md:w-[260px] md:flex-none md:ml-auto">
      <div className="flex flex-row gap-3">
        {ticket.isInPerson && (
          <Button
            variant="newPrimary"
            size={buttonSize}
            mode="light"
            iconRight={isPending ? <FiLoader /> : undefined}
            onClick={async () => {
              const base64 = await downloadTicketAsync({
                eventId: ticket.eventId,
                userDisplayName: userDisplayName,
              });
              const link = document.createElement('a');
              link.href = `data:application/pdf;base64,${base64}`;
              link.download = 'ticket.pdf';
              document.body.append(link);
              link.click();
              link.remove();
            }}
          >
            {t('words.download')}
          </Button>
        )}

        {ticket.isOnline && (
          <Link
            to={'/events/$eventId'}
            params={{
              eventId: ticket.eventId,
            }}
          >
            <Button
              variant="newPrimary"
              size={buttonSize}
              mode="light"
              disabled={new Date(ticket.date).getTime() > Date.now()}
            >
              {t('dashboard.booking.accessLive')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

import { Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLoader } from 'react-icons/fi';

import type { Ticket } from '@blms/types';
import { Button, Card } from '@blms/ui';

import { AppContext } from '#src/providers/context.js';
import { formatDate, formatTime } from '#src/utils/date.js';
import { trpc } from '#src/utils/trpc.js';

export const BookingPart = ({ tickets }: { tickets: Ticket[] }) => {
  const { t } = useTranslation();

  const { user } = useContext(AppContext);

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
                    {formatDate(ticket.date)}
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

                <Card
                  withPadding={false}
                  className="flex md:hidden p-3"
                  color="gray"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-newBlack-1 font-medium">
                      {ticket.title}
                    </span>
                    <span className="flex-none  text-sm">
                      {formatDate(ticket.date)} - {location}
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
  ticket: Ticket;
  userDisplayName: string;
  buttonSize: 's' | 'm';
}) => {
  const { t } = useTranslation();

  const { i18n } = useTranslation();

  const { mutateAsync: downloadTicketAsync, isPending: isPendingTicket } =
    trpc.user.events.downloadEventTicket.useMutation();

  const { mutateAsync: downloadChapterTicket, isPending: isPendingChapter } =
    trpc.user.courses.downloadChapterTicket.useMutation();

  // TODO should only fetch on click
  const { data: chapter, isFetched: isChapterFetched } =
    trpc.content.getCourseChapter.useQuery(
      {
        language: i18n.language,
        chapterId: ticket.eventId,
      },
      {
        enabled: ticket.type === 'course',
      },
    );

  const { data: course } = trpc.content.getCourse.useQuery(
    {
      language: i18n.language,
      id: chapter ? chapter.courseId : '',
    },
    {
      enabled: isChapterFetched,
      staleTime: 300_000, // 5 minutes
    },
  );

  let timezone: string,
    formattedStartDate: string,
    formattedTime: string,
    formattedCapacity: string;

  if (chapter) {
    timezone = chapter.timezone ? chapter.timezone : '';
    formattedStartDate = chapter.startDate ? formatDate(chapter.startDate) : '';
    formattedTime =
      chapter.startDate && chapter.endDate
        ? `${formatTime(chapter.startDate, timezone)} ${t('words.to')} ${formatTime(chapter.endDate, timezone)}`
        : '';
    formattedCapacity = chapter.availableSeats
      ? `limited to ${chapter.availableSeats} people`
      : '';
  }

  return (
    <div className="md:w-[260px] md:flex-none md:ml-auto">
      <div className="flex flex-row gap-3">
        {ticket.isInPerson && (
          <Button
            variant="primary"
            size={buttonSize}
            mode="light"
            onClick={async () => {
              let base64 = '';

              if (ticket.type === 'course') {
                if (course && chapter) {
                  base64 = await downloadChapterTicket({
                    ...chapter,
                    ...course,
                    formattedStartDate,
                    formattedTime,
                    formattedCapacity,
                    userDisplayName,
                  });
                } else {
                  return;
                }
              } else {
                base64 = await downloadTicketAsync({
                  eventId: ticket.eventId,
                  userDisplayName: userDisplayName,
                });
              }

              const link = document.createElement('a');
              link.href = `data:application/pdf;base64,${base64}`;
              link.download = 'ticket.pdf';
              document.body.append(link);
              link.click();
              link.remove();
            }}
          >
            {t('words.download')}
            {isPendingTicket || isPendingChapter ? (
              <span className="ml-3">
                <FiLoader />
              </span>
            ) : null}
          </Button>
        )}

        {ticket.isOnline && (
          <Link
            to={
              ticket.type === 'course'
                ? '/courses/$courseId/$chapterId'
                : '/events/$eventId'
            }
            params={
              ticket.type === 'course'
                ? { courseId: 'biz102', chapterId: ticket.eventId }
                : {
                    eventId: ticket.eventId,
                  }
            }
          >
            <Button
              variant="primary"
              size={buttonSize}
              mode="light"
              disabled={ticket.date.getTime() > Date.now()}
            >
              {t('dashboard.booking.accessLive')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

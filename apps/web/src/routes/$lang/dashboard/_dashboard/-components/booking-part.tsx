import type { Ticket } from '@blms/types';
import { BasicModal, Button, Card, DialogClose } from '@blms/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLoader } from 'react-icons/fi';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.js';
import { formatDate, formatHourRange } from '#src/utils/date.js';
import { base64ToBlob } from '#src/utils/misc.ts';
import { trpc } from '#src/utils/trpc.js';

export const BookingPart = ({
  tickets,
  refetchTickets,
}: {
  tickets: Ticket[];
  refetchTickets?: any;
}) => {
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
            <span className="w-[150px] flex-none mr-28">
              {t('words.ticket')}
            </span>
          </div>
          {tickets.map((ticket) => {
            const location = ticket.isInPerson
              ? ticket.location
              : t('words.online');
            return (
              <div key={ticket.eventId}>
                <div className="hidden md:flex md:items-center flex-row gap-4 text-black">
                  <span className="w-[150px] flex-none text-dashboardSectionText/75">
                    {formatDate(ticket.date)}
                  </span>
                  <span className="w-[150px] flex-none capitalize text-dashboardSectionText/75 line-clamp-1">
                    {location}
                  </span>
                  <span className="w-[100px] flex-none capitalize">
                    {ticket.type}
                  </span>
                  <div className="min-w-[100px] grow">
                    <span className="w-fit font-medium line-clamp-1 text-dashboardSectionTitle">
                      {ticket.title}
                    </span>
                  </div>
                  <Buttons
                    ticket={ticket}
                    refetchTickets={refetchTickets}
                    userName={user?.displayName as string}
                    buttonSize="s"
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
                      refetchTickets={refetchTickets}
                      userName={user?.displayName as string}
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
  refetchTickets,
  userName,
  buttonSize,
}: {
  ticket: Ticket;
  refetchTickets: any;
  userName: string;
  buttonSize: 's' | 'm';
}) => {
  const { t } = useTranslation();

  const { i18n } = useTranslation();

  const { mutateAsync: downloadTicketAsync, isPending: isPendingTicket } =
    useMutation(trpc.user.events.downloadEventTicket.mutationOptions());

  const {
    mutateAsync: downloadTicketMutateAsync,
    isPending: isPendingChapter,
  } = useMutation(trpc.user.courses.downloadChapterTicket.mutationOptions());

  const { mutateAsync: cancelTicket } = useMutation(
    trpc.user.billing.cancelTicket.mutationOptions(),
  );

  // TODO should only fetch on click
  const { data: chapter, isFetched: isChapterFetched } = useQuery(
    trpc.content.getCourseChapter.queryOptions(
      {
        chapterId: ticket.eventId,
        language: i18n.language,
      },
      {
        enabled: ticket.type === 'course',
      },
    ),
  );

  const { data: course } = useQuery(
    trpc.content.getCourse.queryOptions(
      {
        id: chapter ? chapter.courseId : '',
        language: i18n.language,
      },
      {
        enabled: isChapterFetched,
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  let timezone: string;
  let formattedStartDate: string;
  let formattedTime: string;

  if (chapter) {
    timezone = chapter.timezone ? chapter.timezone : 'UTC';
    formattedStartDate = chapter.startDate ? formatDate(chapter.startDate) : '';
    formattedTime =
      chapter.startDate && chapter.endDate
        ? `${formatHourRange(chapter.startDate, chapter.endDate, timezone)}`
        : '';
  }

  const now = new Date();

  return (
    <div className="md:w-[260px] md:flex-none md:ml-auto">
      <div className="flex flex-row gap-5">
        {ticket.isInPerson && (
          <Button
            variant="primary"
            size={buttonSize}
            mode="light"
            onClick={async () => {
              let base64 = '';

              if (ticket.type === 'course') {
                if (course && chapter) {
                  base64 = await downloadTicketMutateAsync({
                    organizer: course.projectName ?? 'Plan ₿ Network',
                    ...chapter,
                    ...course,
                    availableSeats: chapter.availableSeats,
                    formattedStartDate,
                    formattedTime,
                    userName,
                  });
                } else {
                  return;
                }
              } else {
                base64 = await downloadTicketAsync({
                  eventId: ticket.eventId,
                  userName: userName,
                });
              }

              const fileName = 'ticket.pdf';
              const blob = base64ToBlob(base64, 'application/pdf');
              const url = window.URL.createObjectURL(blob);

              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', fileName);

              document.body.appendChild(link);

              link.click();

              link.parentNode?.removeChild(link);
              window.URL.revokeObjectURL(url);
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
            to={'/events/$eventId'}
            params={{
              eventId: ticket.eventId,
            }}
            disabled={ticket.date.getTime() - 60 * 60 * 1000 > Date.now()}
          >
            <Button
              variant="primary"
              size={buttonSize}
              mode="light"
              disabled={ticket.date.getTime() - 60 * 60 * 1000 > Date.now()}
            >
              {t('dashboard.booking.accessLive')}
            </Button>
          </Link>
        )}
        {!ticket.isPaid && ticket.date > now ? (
          <CancelBookingDialog
            onConfirm={async () => {
              await cancelTicket({
                eventType: ticket.type,
                ticketId: ticket.eventId,
              });
              if (refetchTickets) {
                refetchTickets();
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

const CancelBookingDialog = ({ onConfirm }: { onConfirm: () => void }) => {
  const isMobile = useSmaller('md');

  return (
    <BasicModal
      trigger={
        <button
          type="button"
          className="underline decoration-darkOrange-5 text-darkOrange-5"
        >
          {t('words.cancel')}
        </button>
      }
      title={t('dashboard.booking.cancelBookingTitle')}
      showLogo={true}
    >
      <div className="!flex gap-4 md:!gap-[30px]">
        <DialogClose asChild>
          <Button
            variant="primary"
            size={isMobile ? 's' : 'l'}
            className="!w-fit"
            onClick={onConfirm}
          >
            {t('dashboard.booking.yesCancel')}
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="outline"
            size={isMobile ? 's' : 'l'}
            className="w-fit"
          >
            {t('dashboard.booking.noGoBack')}
          </Button>
        </DialogClose>
      </div>
    </BasicModal>
  );
};

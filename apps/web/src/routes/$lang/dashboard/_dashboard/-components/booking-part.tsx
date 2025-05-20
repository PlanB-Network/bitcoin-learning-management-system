import { Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLoader } from 'react-icons/fi';

import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black.svg';

import type { Ticket } from '@blms/types';
import {
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@blms/ui';

import { t } from 'i18next';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.js';
import { formatDate, formatTime } from '#src/utils/date.js';
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
    trpc.user.events.downloadEventTicket.useMutation();

  const {
    mutateAsync: downloadTicketMutateAsync,
    isPending: isPendingChapter,
  } = trpc.user.courses.downloadChapterTicket.useMutation();

  const { mutateAsync: cancelTicket } =
    trpc.user.billing.cancelTicket.useMutation();

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

  let timezone: string;
  let formattedStartDate: string;
  let formattedTime: string;

  if (chapter) {
    timezone = chapter.timezone ? chapter.timezone : 'UTC';
    formattedStartDate = chapter.startDate ? formatDate(chapter.startDate) : '';
    formattedTime =
      chapter.startDate && chapter.endDate
        ? `${formatTime(chapter.startDate, timezone)} ${t('words.to')} ${formatTime(chapter.endDate, timezone)}`
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
                    formattedStartDate,
                    formattedTime,
                    availableSeats: chapter.availableSeats,
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
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="underline decoration-darkOrange-5 text-darkOrange-5"
        >
          {t('words.cancel')}
        </button>
      </DialogTrigger>
      <DialogContent
        className="!bg-white !shadow-course-navigation !border-[#D1D5DB] !rounded-[20px] !flex !flex-col !w-full max-w-[87.5%] md:!max-w-[530px] !px-[15px] !py-5 md:!p-6 gap-6 md:!gap-10 !items-center"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="hidden">
            {t('dashboard.booking.cancelBookingTitle')}
          </DialogTitle>
          <DialogDescription className="hidden">
            {t('dashboard.booking.cancelBookingTitle')}
          </DialogDescription>
        </DialogHeader>

        <img
          src={PlanBLogoBlack}
          alt="Logo Plan ₿ Network"
          className="w-[186px] md:w-[266px] mx-auto"
        />

        <div className="w-full justify-center items-center flex flex-col gap-5 md:gap-6 md:py-5">
          <p className="text-darkOrange-5 title-medium-sb-18px md:title-large-24px text-center px-7">
            {t('dashboard.booking.cancelBookingTitle')}
          </p>
        </div>

        <div className="!flex gap-4 md:!gap-[30px] pb-[30px]">
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
      </DialogContent>
    </Dialog>
  );
};

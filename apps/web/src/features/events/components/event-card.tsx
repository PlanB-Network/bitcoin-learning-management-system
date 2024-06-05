import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { HiVideoCamera } from 'react-icons/hi2';

import type {
  EventPayment,
  JoinedEvent,
  UserEvent,
} from '@sovereign-university/types';
import { Button, cn } from '@sovereign-university/ui';

import { useGreater } from '#src/hooks/use-greater.js';

import Flag from '../../../atoms/Flag/index.tsx';
import { getDateString, getTimeString } from '../../../utils/date.ts';

interface EventCardProps {
  event: JoinedEvent;
  eventPayments: EventPayment[] | undefined;
  userEvents: UserEvent[] | undefined;
  isLive?: boolean;
  isPassed?: boolean;
  openAuthModal: () => void;
  isLoggedIn: boolean;
  setIsPaymentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPaymentModalData: React.Dispatch<
    React.SetStateAction<{
      eventId: string | null;
      satsPrice: number | null;
      accessType: 'physical' | 'online' | 'replay' | null;
    }>
  >;
  conversionRate: number | null;
}

export const EventCard = ({
  event,
  eventPayments,
  userEvents,
  isLive,
  isPassed,
  openAuthModal,
  isLoggedIn,
  setIsPaymentModalOpen,
  setPaymentModalData,
  conversionRate,
}: EventCardProps) => {
  const { t } = useTranslation();

  let satsPrice =
    conversionRate && event.priceDollars !== null
      ? Math.round((event.priceDollars * 100_000_000) / conversionRate)
      : -1;
  if (satsPrice > 10 && process.env.NODE_ENV === 'development') {
    satsPrice = 10;
  }

  let capitalizedType = '';
  if (event.type) {
    capitalizedType =
      event.type?.charAt(0).toUpperCase() + event.type?.slice(1);
  }

  const filteredEventPayments = eventPayments?.filter(
    (payment) =>
      payment.paymentStatus === 'paid' && payment.eventId === event.id,
  );

  const userEvent = userEvents?.find(
    (ue) => ue.booked === true && ue.eventId === event.id,
  );

  const timezone = event.timezone || undefined;
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const dateString = getDateString(startDate, endDate, timezone);
  const timeString = getTimeString(startDate, endDate, timezone);

  const isFree = !event.priceDollars;

  const GeneralInfos = () => {
    return (
      <div className="flex flex-col gap-1">
        <h3 className="font-bold max-lg:leading-snug sm:text-lg lg:text-2xl">
          {event.name}
        </h3>
        <span className="font-medium text-xs sm:text-sm md:text-base">
          {event.builder}
        </span>
        <div className="flex flex-col gap-0.5 text-white/75 text-[10px] sm:text-xs lg:text-sm">
          <div className="flex flex-col gap-1">
            <span>{dateString}</span>
            {startDate.getUTCHours() !== 0 &&
              endDate.getUTCHours() !== 0 &&
              !isPassed && <span>{timeString}</span>}
          </div>
          {event.bookInPerson && !isPassed && (
            <>
              <div className="h-px w-full bg-newBlack-5" />
              <span>{event.addressLine2}</span>
              <span>{event.addressLine3}</span>
              <span className="font-medium ">
                {event.addressLine1?.toUpperCase()}
              </span>
            </>
          )}
          {event.bookOnline && !isPassed && !event.bookInPerson && (
            <span className="bg-newGray-4 border border-newGray-2 text-xs text-newBlack-4 font-medium leading-none py-1 px-2 rounded-sm w-fit lg:text-sm">
              {t('events.card.online')}
            </span>
          )}
        </div>
      </div>
    );
  };

  const PriceInfos = () => {
    return (
      <div className="flex flex-col justify-center text-sm md:text-base">
        {!isFree && (
          <div className="flex gap-1 text-orange-600">
            <span className="font-semibold">${event.priceDollars}</span>
            <span>·</span>
            <span>{satsPrice} sats</span>
          </div>
        )}
        {isPassed ? null : isFree ? (
          <span className="font-semibold uppercase text-orange-600">
            {t('events.card.free')}
          </span>
        ) : (
          <span className="font-light text-xs italic leading-none">
            {event.availableSeats && event.availableSeats > 0
              ? `${t('events.card.limited')} ${event.availableSeats} ${t('events.card.people')}`
              : t('events.card.unlimited')}
          </span>
        )}
      </div>
    );
  };

  const EventButtons = () => {
    const isScreenSm = useGreater('sm');

    const isBookableOnlineEvent = event.bookOnline;

    const isFreeOnlineLiveEvent = isBookableOnlineEvent && isFree && isLive;
    const isPaidOnlineLiveEvent = isBookableOnlineEvent && !isFree && isLive;

    const isFreeOnlineUpcomingEvent =
      isBookableOnlineEvent && isFree && !isLive && !isPassed;
    const isPaidOnlineUpcomingEvent =
      isBookableOnlineEvent && !isFree && !isLive && !isPassed;

    const isBookableInPersonEvent = event.bookInPerson && !isPassed;

    const userBookedTheEvent =
      (filteredEventPayments && filteredEventPayments.length > 0) ||
      userEvent !== undefined;
    const userBookedPhysicalEvent =
      (filteredEventPayments &&
        filteredEventPayments.length > 0 &&
        filteredEventPayments[0].withPhysical === true) ||
      (userEvent !== undefined && userEvent.withPhysical === true);

    return (
      <div className="flex items-center gap-2.5 sm:gap-4">
        {isFreeOnlineLiveEvent && (
          <Link
            to={'/events/$eventId'}
            params={{
              eventId: event.id,
            }}
          >
            <Button
              size={isScreenSm ? 's' : 'xs'}
              variant="newPrimary"
              className="rounded-lg text-xs md:text-base"
            >
              {t('events.card.watchLive')}
            </Button>
          </Link>
        )}

        {isPaidOnlineLiveEvent &&
          (userBookedTheEvent ? (
            <Link
              to={'/events/$eventId'}
              params={{
                eventId: event.id,
              }}
            >
              <Button
                size={isScreenSm ? 's' : 'xs'}
                variant="newPrimary"
                className="rounded-lg text-xs md:text-base"
              >
                {t('events.card.watchLive')}
              </Button>
            </Link>
          ) : (
            <Button
              variant="newPrimary"
              size={isScreenSm ? 's' : 'xs'}
              className="rounded-lg text-xs md:text-base"
              onClick={() => {
                if (isLoggedIn) {
                  setPaymentModalData({
                    eventId: event.id,
                    satsPrice: satsPrice,
                    accessType: 'online',
                  });
                  setIsPaymentModalOpen(true);
                } else {
                  openAuthModal();
                }
              }}
            >
              {t('events.card.bookLive')}
            </Button>
          ))}

        {isFreeOnlineUpcomingEvent && (
          <Button
            size={isScreenSm ? 's' : 'xs'}
            variant="newSecondary"
            disabled={true}
            className="rounded-lg text-xs md:text-base"
          >
            {t('events.card.watchLive')}
          </Button>
        )}

        {isPaidOnlineUpcomingEvent &&
          (userBookedTheEvent ? (
            <Link to={'/events/' + event.id} target="_blank" className="w-fit">
              <Button
                size={isScreenSm ? 's' : 'xs'}
                variant="newSecondary"
                disabled={true}
                className="rounded-lg text-xs md:text-base"
              >
                {t('events.card.watchLive')}
              </Button>
            </Link>
          ) : (
            <Button
              variant="newPrimary"
              size={isScreenSm ? 's' : 'xs'}
              className="rounded-lg text-xs md:text-base"
              onClick={() => {
                if (isLoggedIn) {
                  setPaymentModalData({
                    eventId: event.id,
                    satsPrice: satsPrice,
                    accessType: 'online',
                  });
                  setIsPaymentModalOpen(true);
                } else {
                  openAuthModal();
                }
              }}
            >
              {t('events.card.bookLive')}
            </Button>
          ))}

        {/* TODO Book seat actions (before and after booking seat, free and paid) + case where both physical and online (differentiate payment ?) */}
        {isBookableInPersonEvent && !userBookedTheEvent && (
          <>
            {event &&
            event.remainingSeats &&
            event.remainingSeats > 0 &&
            userEvent === undefined ? (
              <Button
                variant="newPrimary"
                size={isScreenSm ? 's' : 'xs'}
                className="rounded-lg text-xs md:text-base"
                onClick={() => {
                  if (isLoggedIn) {
                    setPaymentModalData({
                      eventId: event.id,
                      satsPrice: satsPrice,
                      accessType: 'physical',
                    });
                    setIsPaymentModalOpen(true);
                  } else {
                    openAuthModal();
                  }
                }}
              >
                {t('events.card.bookSeat')}
              </Button>
            ) : (
              <>
                <span className="italic">{t('events.card.eventFull')}</span>
              </>
            )}
          </>
        )}

        {isBookableInPersonEvent &&
          userBookedTheEvent &&
          userBookedPhysicalEvent && (
            <span className="italic">{t('events.card.seatBooked')}</span>
          )}

        {isPassed && <ReplayButtons />}
      </div>
    );
  };

  const ReplayButtons = () => {
    const isScreenSm = useGreater('sm');

    return (filteredEventPayments && filteredEventPayments.length > 0) ||
      isFree ? (
      <Link to={'/events/' + event.id} className="w-fit">
        <Button
          iconRight={<HiVideoCamera size={18} />}
          variant="newSecondary"
          size={isScreenSm ? 's' : 'xs'}
          className="rounded-lg text-xs md:text-base"
        >
          {t('events.card.watchReplay')}
        </Button>
      </Link>
    ) : (
      <Button
        iconRight={<HiVideoCamera size={18} />}
        variant="newSecondary"
        size={isScreenSm ? 's' : 'xs'}
        className="rounded-lg text-xs md:text-base"
        onClick={() => {
          if (isLoggedIn) {
            setPaymentModalData({
              eventId: event.id,
              satsPrice: satsPrice,
              accessType: 'replay',
            });
            setIsPaymentModalOpen(true);
          } else {
            openAuthModal();
          }
        }}
      >
        {t('events.card.buyReplay')}
      </Button>
    );
  };

  const VisitWebsiteButton = () => {
    const isScreenSm = useGreater('sm');

    return event.websiteUrl ? (
      <div className="w-fit mx-auto mt-auto pt-3 pb-1">
        <Link to={event.websiteUrl} target="_blank">
          <Button
            variant="newPrimary"
            size={isScreenSm ? 's' : 'xs'}
            className="rounded-lg text-xs md:text-base"
          >
            {t('events.card.visitWebsite')}
          </Button>
        </Link>
      </div>
    ) : null;
  };

  return (
    <>
      <article
        className={cn(
          'flex-1 flex flex-col max-sm:min-w-[182px] max-sm:max-w-[182px] w-full sm:min-w-[316px] sm:max-w-[316px] bg-newBlack-3 p-1.5 rounded-xl sm:p-2 sm:rounded-2xl',
          isLive ? 'shadow-md-section sm:shadow-none' : '',
        )}
      >
        {/* Image */}
        <div className="w-full overflow-hidden rounded-2xl relative mb-2 lg:mb-4">
          <img
            src={event.picture}
            alt={event.name ? event.name : ''}
            className="object-cover aspect-[432/308] w-full"
          />
          {event.type && (
            <span className="absolute left-2.5 top-2.5 sm:top-4 sm:left-4 bg-white border border-newGray-3 text-black text-sm font-medium leading-none py-1 px-2 rounded-sm">
              {capitalizedType}
            </span>
          )}
          <div className="absolute right-2.5 top-2.5 sm:top-4 sm:right-4 bg-white border border-newGray-3 p-1 flex flex-col justify-center items-center gap-1 rounded-sm">
            {event.languages.map((language: string) => (
              <Flag code={language} size="m" key={language} />
            ))}
          </div>
        </div>
        <GeneralInfos />
        {!event.websiteUrl && (
          <div className="flex flex-col gap-2.5 justify-between mt-auto py-1">
            <PriceInfos />
            <EventButtons />
          </div>
        )}
        <VisitWebsiteButton />
      </article>
    </>
  );
};

import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { HiVideoCamera } from 'react-icons/hi2';

import type { EventPayment, JoinedEvent, UserEvent } from '@blms/types';
import { Button, cn } from '@blms/ui';

import Flag from '#src/atoms/Flag/index.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { getDateString, getTimeString } from '#src/utils/date.js';

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
  const startDate = event.startDate;
  const endDate = event.endDate;

  const dateString = getDateString(startDate, endDate, timezone);
  const timeString = getTimeString(startDate, endDate, timezone);

  const isFree = !event.priceDollars;

  const GeneralInfos = () => {
    return (
      <div className={cn('flex flex-col gap-1', isPassed && 'select-none')}>
        <h3 className="font-semibold max-lg:leading-snug sm:text-lg lg:text-2xl max-sm:line-clamp-1">
          {event.name}
        </h3>
        <span className="font-medium text-xs sm:text-sm md:text-base max-sm:hidden">
          {event.builder}
        </span>
        <div className="flex flex-col gap-1 text-white/75 text-[10px] sm:text-xs lg:text-sm">
          <div className="flex flex-col gap-1">
            <span className="max-sm:line-clamp-1">{dateString}</span>
            {startDate.getUTCHours() !== 0 &&
              endDate.getUTCHours() !== 0 &&
              !isPassed && <span className="max-sm:hidden">{timeString}</span>}
          </div>
          {(event.bookInPerson || event.addressLine1) && !isPassed && (
            <>
              <span className="max-sm:hidden">{event.addressLine2}</span>
              <span className="max-sm:hidden">{event.addressLine3}</span>
              <span className="sm:font-medium max-sm:line-clamp-1">
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
          <div className="flex gap-1 text-orange-600 max-sm:text-sm max-sm:leading-normal">
            <span className="font-semibold">${event.priceDollars}</span>
            <span className="max-sm:hidden">·</span>
            <span className="max-sm:hidden">{satsPrice} sats</span>
          </div>
        )}
        {isPassed ? null : isFree ? (
          <span className="max-sm:text-sm font-semibold uppercase text-orange-600 max-sm:leading-normal">
            {t('events.card.free')}
          </span>
        ) : (
          <span className="font-light text-xs italic leading-none max-sm:hidden">
            {event.availableSeats && event.availableSeats > 0
              ? `${t('events.card.limited')} ${event.availableSeats} ${t('events.card.people')}`
              : t('events.card.unlimited')}
          </span>
        )}
        <span className="sm:hidden capitalize text-[10px] font-medium max-sm:leading-normal">
          {event.type}
        </span>
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

        {isPassed && event.type !== 'conference' && <ReplayButtons />}
      </div>
    );
  };

  const ReplayButtons = () => {
    const isScreenSm = useGreater('sm');

    if (event.type === 'conference') {
      return (
        <Link to={'/resources/conferences'} className="w-fit">
          <Button
            iconRight={<HiVideoCamera size={18} />}
            variant="newSecondary"
            size={isScreenSm ? 's' : 'xs'}
            className="rounded-lg text-xs md:text-base"
          >
            {t('events.card.watchReplay')}
          </Button>
        </Link>
      );
    }

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
      <div className="w-fit sm:mx-auto mt-auto sm:pt-3 sm:pb-1">
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
          'flex-1 flex flex-col max-w-[360px] w-full sm:min-w-[316px] sm:max-w-[316px] bg-newBlack-3 rounded-xl sm:p-2 sm:rounded-2xl max-sm:overflow-hidden',
          isLive ? 'shadow-md-section sm:shadow-none' : '',
          isPassed ? 'min-w-[280px]' : 'min-w-[290px]',
        )}
      >
        <div className="max-sm:flex">
          {/* Image */}
          <div className="w-[126px] sm:w-full overflow-hidden sm:rounded-2xl relative sm:mb-2 lg:mb-4 max-sm:shrink-0">
            <img
              src={event.picture}
              alt={event.name ? event.name : ''}
              className="object-cover [overflow-clip-margin:_unset] sm:aspect-[432/308] w-full max-sm:h-[113px] sm:rounded-2xl"
            />
            {event.type && (
              <span className="absolute top-4 left-4 bg-white border border-newGray-3 text-black text-sm font-medium leading-none py-1 px-2 rounded-sm max-sm:hidden">
                {capitalizedType}
              </span>
            )}
            <div className="absolute max-sm:left-1.5 top-1.5 sm:top-4 sm:right-4 bg-white border border-newGray-3 p-1 flex flex-col justify-center items-center gap-1 rounded-sm max-sm:hidden">
              {event.languages.map((language: string) => (
                <Flag code={language} size="m" key={language} />
              ))}
            </div>
          </div>
          <div className="max-sm:hidden">
            <GeneralInfos />
          </div>
          <div className="flex flex-col sm:hidden p-1">
            <GeneralInfos />
            {!event.websiteUrl && (
              <div className="flex sm:flex-col gap-2.5 justify-between mt-auto sm:py-1">
                <PriceInfos />
                <EventButtons />
              </div>
            )}
            {isPassed && event.type === 'conference' && (
              <div className="mt-2.5">
                <ReplayButtons />
              </div>
            )}
            {(!isPassed || (isPassed && event.type !== 'conference')) && (
              <VisitWebsiteButton />
            )}
          </div>
        </div>
        <div className="max-sm:hidden mt-auto">
          {!event.websiteUrl && (
            <div className="flex sm:flex-col gap-2.5 justify-between mt-1 sm:mt-auto sm:py-1">
              <PriceInfos />
              <EventButtons />
            </div>
          )}
          {isPassed && event.type === 'conference' && (
            <div className="mt-1 sm:mt-auto sm:py-1">
              <ReplayButtons />
            </div>
          )}
          {(!isPassed || (isPassed && event.type !== 'conference')) && (
            <VisitWebsiteButton />
          )}
        </div>
      </article>
    </>
  );
};

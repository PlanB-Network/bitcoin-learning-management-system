import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { JoinedEvent } from '@sovereign-university/types';

import { Anchor } from '../../../atoms/Anchor/index.tsx';
import { Button } from '../../../atoms/Button/index.tsx';
import Flag from '../../../atoms/Flag/index.tsx';
import { formatDate, formatTime } from '../../../utils/date.ts';

interface EventCardProps {
  event: JoinedEvent;
  isLive?: boolean;
  conversionRate: number | null;
}

export const EventCard = ({
  event,
  isLive,
  conversionRate,
}: EventCardProps) => {
  const { t } = useTranslation();

  let satsPrice =
    conversionRate && event.priceDollars !== null
      ? Math.round((event.priceDollars * 100_000_000) / conversionRate)
      : -1;
  if (process.env.NODE_ENV === 'development') {
    satsPrice = 10;
  }

  let capitalizedType = '';
  if (event.type) {
    capitalizedType =
      event.type?.charAt(0).toUpperCase() + event.type?.slice(1);
  }

  const timezone = event.timezone || undefined;

  const timezoneText = timezone ? ` (${timezone})` : '';

  let dateString =
    new Date(event.startDate).getMonth() ===
      new Date(event.endDate).getMonth() &&
    new Date(event.startDate).getDay() !== new Date(event.endDate).getDay()
      ? formatDate(new Date(event.startDate), timezone, false)
      : formatDate(new Date(event.startDate), timezone);

  if (
    new Date(event.startDate).getDate() !== new Date(event.endDate).getDate()
  ) {
    dateString += ` to ${formatDate(new Date(event.endDate), timezone)}`;
  }

  let timeString;
  if (new Date(event.startDate).getUTCHours() !== 0) {
    timeString = formatTime(new Date(event.startDate), timezone);
  }
  if (new Date(event.endDate).getUTCHours() !== 0) {
    timeString += ` to ${formatTime(new Date(event.endDate), timezone)}${timezoneText}`;
  }

  const isFree = !event.priceDollars;

  return (
    <article
      className={`flex-1 flex flex-col min-w-[280px] max-[611px]:max-w-[432px] bg-[#1a1a1a] p-2.5 rounded-xl md:min-w-80 md:max-w-[432px] lg:min-w-96 sm:bg-transparent sm:p-0 sm:rounded-none ${isLive ? 'shadow-md-section sm:shadow-none' : ''}`}
    >
      {/* Image */}
      <div className="w-full overflow-hidden rounded-2xl relative mb-2 lg:mb-4">
        <img
          src={event.picture}
          alt={event.name ? event.name : ''}
          className="object-cover aspect-[432/308]"
          width={432}
          height={308}
        />
        {event.type && (
          <span className="absolute top-4 left-4 bg-white border border-[#b2b2b2] text-black text-sm font-medium leading-none py-1 px-2 rounded-sm">
            {capitalizedType}
          </span>
        )}
        <div className="absolute top-4 right-4 bg-white border border-[#b2b2b2] p-1 flex flex-col justify-center items-center gap-1 rounded-sm">
          {event.languages.map((language: string) => (
            <Flag code={language} size="m" key={language} />
          ))}
        </div>
      </div>
      {/* Infos */}
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-lg lg:text-2xl">{event.name}</h3>
        <span className="font-medium text-sm lg:text-base">
          {event.builder}
        </span>
        <div className="flex flex-col gap-0.5 text-white/75 text-xs lg:text-sm">
          <div className="flex gap-1">
            <span>{dateString}</span>
            {new Date(event.startDate).getUTCHours() !== 0 &&
              new Date(event.endDate).getUTCHours() !== 0 && (
                <>
                  <span>·</span>
                  <span>{timeString}</span>
                </>
              )}
          </div>
          {event.isInPerson && (
            <>
              <span>{event.addressLine2}</span>
              <span>{event.addressLine3}</span>
              <span className="font-medium ">
                {event.addressLine1?.toUpperCase()}
              </span>
            </>
          )}
          {event.isOnline && !event.isInPerson && (
            <span className="bg-[#cccccc] border border-[#999999] text-xs text-[#4d4d4d] font-medium leading-none py-1 px-2 rounded-sm w-fit lg:text-sm">
              {t('events.card.online')}
            </span>
          )}
        </div>
      </div>
      {/* Price and buttons */}
      <div className="flex flex-wrap justify-self-end gap-2 justify-between mt-auto py-1">
        <div className="flex flex-col text-sm lg:text-base">
          {!isFree && (
            <div className="flex gap-1 text-orange-600">
              <span className="font-semibold">${event.priceDollars}</span>
              <span>·</span>
              <span>{satsPrice} sats</span>
            </div>
          )}
          {isFree && (
            <span className="font-semibold uppercase text-orange-600">
              {t('events.card.free')}
            </span>
          )}
          <span className="font-light text-xs italic leading-none">
            {event.availableSeats && event.availableSeats > 0
              ? `${t('events.card.limited')} ${event.availableSeats} ${t('events.card.people')}`
              : t('events.card.unlimited')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {event.isOnline && isFree && isLive && (
            <Link
              to={'/events/$eventId'}
              params={{
                eventId: event.id,
              }}
            >
              <Button
                size="s"
                variant="tertiary"
                className="rounded-lg text-xs lg:text-base"
              >
                {t('events.card.watchLive')}
              </Button>
            </Link>
          )}
          {event.isOnline && isFree && !isLive && (
            <Button
              size="s"
              disabled={true}
              className="rounded-lg text-xs lg:text-base"
            >
              {t('events.card.watchLive')}
            </Button>
          )}
          {event.isOnline && !isFree && (
            <Button
              variant="tertiary"
              size="s"
              className="rounded-lg text-xs lg:text-base"
            >
              {t('events.card.bookLive')}
            </Button>
          )}
          {event.isInPerson &&
            event.availableSeats &&
            event.availableSeats > 0 && (
              <Button
                variant="tertiary"
                size="s"
                className="rounded-lg text-xs lg:text-base"
              >
                {t('events.card.bookSeat')}
              </Button>
            )}
          {event.websiteUrl && (
            <Anchor
              href={event.websiteUrl}
              variant="tertiary"
              size="s"
              className="rounded-lg text-xs lg:text-base"
            >
              {t('events.card.visitWebsite')}
            </Anchor>
          )}
        </div>
      </div>
    </article>
  );
};

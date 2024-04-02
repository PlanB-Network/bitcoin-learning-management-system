import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { HiVideoCamera } from 'react-icons/hi2';

import type { JoinedEvent } from '@sovereign-university/types';

import { Button } from '../../../atoms/Button/index.tsx';
import Flag from '../../../atoms/Flag/index.tsx';
import { formatDate, formatTime } from '../../../utils/date.ts';
import { compose } from '../../../utils/index.ts';

interface EventCardProps {
  event: JoinedEvent;
  isLive?: boolean;
  isPassed?: boolean;
  conversionRate: number | null;
}

export const EventCard = ({
  event,
  isLive,
  isPassed,
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
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const dateString = getDateString(startDate, endDate, timezone);
  const timeString = getTimeString(startDate, endDate, timezone);

  const isFree = !event.priceDollars;

  return (
    <article
      className={compose(
        'flex-1 flex flex-col min-w-[280px] max-w-[432px] bg-newBlack-2 p-2.5 rounded-xl md:min-w-80 lg:min-w-96 sm:bg-transparent sm:p-0 sm:rounded-none',
        isLive ? 'shadow-md-section sm:shadow-none' : '',
        isPassed ? 'h-full' : '',
      )}
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
          <span className="absolute top-4 left-4 bg-white border border-newGray-3 text-black text-sm font-medium leading-none py-1 px-2 rounded-sm">
            {capitalizedType}
          </span>
        )}
        <div className="absolute top-4 right-4 bg-white border border-newGray-3 p-1 flex flex-col justify-center items-center gap-1 rounded-sm">
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
            {startDate.getUTCHours() !== 0 &&
              endDate.getUTCHours() !== 0 &&
              !isPassed && (
                <>
                  <span>·</span>
                  <span>{timeString}</span>
                </>
              )}
          </div>
          {event.isInPerson && !isPassed && (
            <>
              <span>{event.addressLine2}</span>
              <span>{event.addressLine3}</span>
              <span className="font-medium ">
                {event.addressLine1?.toUpperCase()}
              </span>
            </>
          )}
          {event.isOnline && !isPassed && !event.isInPerson && (
            <span className="bg-newGray-4 border border-newGray-2 text-xs text-newBlack-4 font-medium leading-none py-1 px-2 rounded-sm w-fit lg:text-sm">
              {t('events.card.online')}
            </span>
          )}
        </div>
      </div>
      {/* Price and buttons */}
      {!event.websiteUrl && !isPassed && (
        <div className="flex flex-wrap gap-2 justify-between mt-auto py-1">
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
                  variant="newPrimary"
                  className="rounded-lg text-xs lg:text-base"
                >
                  {t('events.card.watchLive')}
                </Button>
              </Link>
            )}
            {event.isOnline && isFree && !isLive && (
              <Button
                size="s"
                variant="newSecondary"
                disabled={true}
                className="rounded-lg text-xs lg:text-base"
              >
                {t('events.card.watchLive')}
              </Button>
            )}
            {event.isOnline && !isFree && (
              <Button
                variant="newPrimary"
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
                  variant="newPrimary"
                  size="s"
                  className="rounded-lg text-xs lg:text-base"
                >
                  {t('events.card.bookSeat')}
                </Button>
              )}
          </div>
        </div>
      )}
      {/* Website URL */}
      {event.websiteUrl && (
        <div className="w-fit mx-auto mt-auto pt-3 pb-1">
          <Link to={event.websiteUrl} target="_blank">
            <Button
              variant="newPrimary"
              size="s"
              className="rounded-lg text-xs lg:text-base"
            >
              {t('events.card.visitWebsite')}
            </Button>
          </Link>
        </div>
      )}
      {/* Replay Button */}
      {event.replayUrl && event.priceDollars === 0 && (
        <div className="w-fit mx-auto mt-auto pt-3 pb-1 sm:ml-auto sm:mr-0">
          <Link to={event.replayUrl} target="_blank">
            <Button
              iconRight={<HiVideoCamera size={18} />}
              variant="newSecondary"
              size="s"
              className="rounded-lg text-xs lg:text-base"
            >
              {t('events.card.watchReplay')}
            </Button>
          </Link>
        </div>
      )}
    </article>
  );
};

const getDateString = (
  startDate: Date,
  endDate: Date,
  timezone: string | undefined,
) => {
  let dateString: string;

  switch (true) {
    case startDate.getDate() === endDate.getDate(): {
      dateString = formatDate(startDate, timezone, true, true);
      break;
    }
    case startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDay() !== endDate.getDay(): {
      dateString = formatDate(startDate, timezone, false, false);
      break;
    }
    case startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() !== endDate.getMonth(): {
      dateString = formatDate(startDate, timezone, true, false);
      break;
    }
    default: {
      dateString = formatDate(startDate, timezone, true, true);
    }
  }

  if (startDate.getDate() !== endDate.getDate()) {
    dateString += ` to ${formatDate(endDate, timezone)}`;
  }

  return dateString;
};

const getTimeString = (
  startDate: Date,
  endDate: Date,
  timezone: string | undefined,
) => {
  const timezoneText = timezone ? ` (${timezone})` : '';

  let timeString: string;

  timeString = formatTime(startDate, timezone);
  if (endDate.getUTCHours() !== 0) {
    timeString += ` to ${formatTime(endDate, timezone)}${timezoneText}`;
  }

  return timeString;
};

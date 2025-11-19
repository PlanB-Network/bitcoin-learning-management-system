import type { JoinedEvent } from '@blms/types';
import { cn, Flag, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import type { IconType } from 'react-icons/lib';
import { TbCalendarEvent, TbChevronRight } from 'react-icons/tb';
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black.svg?react';
import { formatShortDateRange } from '#src/utils/date.js';
import { resourceImgUrl } from '#src/utils/index.ts';

interface EventCardProps {
  event: JoinedEvent;
}

export const EventCard = ({ event }: EventCardProps) => {
  let capitalizedType = '';
  if (event.type) {
    capitalizedType =
      event.type?.charAt(0).toUpperCase() + event.type?.slice(1);
  }

  const timezone = event.timezone || undefined;
  const startDate = event.startDate;
  const endDate = event.endDate;

  const dateString = formatShortDateRange(startDate, endDate, timezone);

  const placeString = event.bookInPerson
    ? event.bookOnline
      ? `${t('words.online')} | ${event.addressLine1}`
      : event.addressLine1
    : t('words.online');

  const GeneralInfos = () => {
    return (
      <div className="flex flex-col justify-between sm:p-4 sm:pt-0 flex-grow sm:gap-7">
        <div className="flex flex-col gap-1 max-sm:grow max-sm:justify-center">
          <span className="title-small sm:title-base text-maroon-11">
            {event.name}
          </span>
          {event.projectId === 'cd62a137-baad-4133-b90d-711963e510c7' ? (
            <PlanBLogoBlack className="h-auto w-21.5 max-sm:hidden" />
          ) : (
            <span className="text-neutral-400 text-sm leading-snug -tracking-015px max-sm:hidden">
              {event.projectName}
            </span>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-0.5 sm:gap-2 sm:mt-auto max-sm:py-1">
          <Chip icon={TbCalendarEvent} text={dateString} />
          {placeString && <Chip text={placeString} />}
        </div>
      </div>
    );
  };

  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        'flex flex-col w-full sm:w-64 border border-neutral-100 rounded-2xl hover:bg-neutral-50',
      )}
    >
      <div className="flex max-sm:gap-2 sm:flex-col flex-grow">
        {/* Image */}
        <div className="w-[112px] sm:w-full overflow-hidden max-sm:rounded-l-lg sm:rounded-t-2xl sm:rounded-b-lg relative sm:mb-2 max-sm:shrink-0">
          <Image
            breakpoints={{ default: 240, sm: 600 }}
            width="432"
            height="308"
            loading="lazy"
            src={resourceImgUrl(event)}
            alt={event.name ? event.name : ''}
            className="object-cover [overflow-clip-margin:_unset] aspect-[4/3] sm:aspect-[432/308] w-full h-full max-sm:rounded-l-2xl sm:rounded-t-2xl sm:rounded-b-lg"
          />
          {event.type && (
            <span className="absolute top-2.5 left-2 border border-neutral-100 text-black bg-white rounded-3xl text-sm font-medium leading-snug -tracking-015px px-2 py-1 max-sm:hidden">
              {capitalizedType}
            </span>
          )}
          <div className="absolute top-2.5 right-2 bg-white p-1 flex flex-col justify-center items-center gap-1 rounded-full max-sm:hidden">
            {event.languages.map((language: string) => (
              <Flag code={language} size="m" key={language} />
            ))}
          </div>
        </div>
        <GeneralInfos />
        <TbChevronRight
          className="sm:hidden text-neutral-300 my-auto mr-1 shrink-0"
          size={16}
        />
      </div>
    </Link>
  );
};

const Chip = ({ icon: Icon, text }: { icon?: IconType; text: string }) => {
  return (
    <div className="flex items-center p-2 sm:px-3 sm:py-2 bg-neutral-50 rounded-full gap-2">
      {Icon && <Icon className="text-brown-400 shrink-0" />}
      <span className="body-small-bold text-black line-clamp-2">{text}</span>
    </div>
  );
};

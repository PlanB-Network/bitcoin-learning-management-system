import { cn } from '@blms/ui';
import { useState } from 'react';
import type { EventProps } from 'react-big-calendar';
import { formatTime } from '#src/utils/date.ts';
import type { CalendarEvent } from './calendar-event.js';

type CustomEventProps = EventProps<CalendarEvent> & {
  truncateTitle?: boolean;
};

export const CustomEventWeek = ({ event, truncateTitle }: CustomEventProps) => {
  const [isSelected, setIsSelected] = useState(false);

  let cssClasses: string;

  switch (event.type) {
    case 'class': {
      cssClasses = 'bg-orange-50 text-orange-500';
      break;
    }
    case 'history': {
      cssClasses = 'bg-brown-200 text-brown-800';
      break;
    }
    case 'event': {
      cssClasses = 'bg-blue-500 text-white';
      break;
    }
    default: {
      cssClasses = 'bg-orange-100 text-orange-700';
      break;
    }
  }

  return (
    <div
      className={cn('p-1', cssClasses)}
      onMouseEnter={() => {
        setIsSelected(true);
      }}
      onMouseLeave={() => {
        setIsSelected(false);
      }}
    >
      {!event.allDay && (
        <div className="flex flex-row text-[10px]">
          {`${formatTime(event.start)} - ${formatTime(event.end)}`}
        </div>
      )}
      <div
        className={cn('font-semibold text-xs', truncateTitle ? 'truncate' : '')}
      >
        {event.title}
      </div>
      {isSelected && (
        <>
          <div className="text-xs">{event.organizer}</div>
          <div className="text-xs">{event.addressLine1}</div>
        </>
      )}
    </div>
  );
};

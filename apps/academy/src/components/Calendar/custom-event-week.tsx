import { cn } from '@blms/ui';
import { format } from 'date-fns';
import { useState } from 'react';
import type { EventProps } from 'react-big-calendar';
import type { CalendarEvent } from './calendar-event.js';

type CustomEventProps = EventProps<CalendarEvent>;

export const CustomEventWeek = ({ event }: CustomEventProps) => {
  const [isSelected, setIsSelected] = useState(false);

  let cssClasses: string;

  switch (event.type) {
    case 'class': {
      cssClasses = 'bg-orange-50 text-orange-500';
      break;
    }
    default: {
      cssClasses = 'bg-[#f2eae5] text-orange-700';
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
      <div className="flex flex-row text-[10px]">
        {`${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}
      </div>
      <div className="font-semibold text-xs">{event.title}</div>
      {isSelected && (
        <>
          <div className="text-xs">{event.organizer}</div>
          <div className="text-xs">{event.addressLine1}</div>
        </>
      )}
    </div>
  );
};

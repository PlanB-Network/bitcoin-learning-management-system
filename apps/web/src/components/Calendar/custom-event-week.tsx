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
      cssClasses = 'bg-darkOrange-0 text-darkOrange-5';
      break;
    }
    default: {
      cssClasses = 'bg-[#f2eae5] text-darkOrange-7';
      break;
    }
  }

  return (
    <div
      className={`${cssClasses}`}
      style={{
        padding: '10px 8px',
        width: '100%',
      }}
      onMouseEnter={() => {
        setIsSelected(true);
      }}
      onMouseLeave={() => {
        setIsSelected(false);
      }}
    >
      <div className="flex flex-row text-xs">
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

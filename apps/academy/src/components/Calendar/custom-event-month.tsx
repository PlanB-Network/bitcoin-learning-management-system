import { useState } from 'react';
import type { EventProps } from 'react-big-calendar';
import { formatTime } from '#src/utils/date.ts';

import type { CalendarEvent } from './calendar-event.ts';

type CustomEventProps = EventProps<CalendarEvent>;

export const CustomEventMonth = ({ event }: CustomEventProps) => {
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
      className={`${cssClasses} flex flex-col hover:z-20 p-1`}
      style={{
        width: '100%',
      }}
      onPointerEnter={() => setIsSelected(true)}
      onPointerLeave={() => setIsSelected(false)}
    >
      {!event.allDay && (
        <div
          className={`flex flex-row text-[8px] md:text-sm pl-1 ${isSelected ? 'order-1' : 'order-2'}`}
        >
          {`${formatTime(event.start)} - ${formatTime(event.end)}`}
        </div>
      )}
      <div className="font-semibold text-[8px] md:text-sm whitespace-normal w-full">
        {event.title}
      </div>
      <div className="text-[8px] md:text-sm whitespace-normal w-full">
        {event.organizer}
      </div>
      <div className="text-[8px] md:text-sm whitespace-normal w-full">
        {event.addressLine1}
      </div>
    </div>
  );
};

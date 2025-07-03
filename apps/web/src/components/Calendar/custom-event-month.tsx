import { format } from 'date-fns';
import { useState } from 'react';
import type { EventProps } from 'react-big-calendar';

import type { CalendarEvent } from './calendar-event.ts';

type CustomEventProps = EventProps<CalendarEvent>;

export const CustomEventMonth = ({ event }: CustomEventProps) => {
  const [isSelected, setIsSelected] = useState(false);

  let cssClasses: string;

  switch (event.type) {
    case 'event': {
      cssClasses = 'bg-[#f2eae5] text-darkOrange-7';
      break;
    }
    case 'class': {
      cssClasses = 'bg-darkOrange-0 text-darkOrange-5';
      break;
    }
    default: {
      cssClasses = 'bg-darkGreen-6 text-darkGreen-1';
      break;
    }
  }

  return (
    <div
      className={`${cssClasses} flex flex-col h-[30px] hover:size-auto hover:relative hover:z-20 transition-all duration-200`}
      style={{
        overflow: isSelected ? 'visible' : 'hidden',
        padding: '10px',
        paddingLeft: 8,
        paddingTop: 8,
        width: '100%',
      }}
      onPointerEnter={() => setIsSelected(true)}
      onPointerLeave={() => setIsSelected(false)}
    >
      <div
        className={`flex flex-row text-sm pl-1 ${isSelected ? 'order-1' : 'order-2'}`}
      >
        {`${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}
      </div>
      <div className="font-semibold text-sm whitespace-normal w-full">
        {event.title}
      </div>
      <div className="text-sm whitespace-normal w-full">{event.organizer}</div>
      <div className="text-sm whitespace-normal w-full">
        {event.addressLine1}
      </div>
    </div>
  );
};

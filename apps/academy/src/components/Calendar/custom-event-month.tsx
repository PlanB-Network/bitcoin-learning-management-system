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
    default: {
      cssClasses = 'bg-[#f2eae5] text-orange-700';
      break;
    }
  }

  return (
    <div
      className={`${cssClasses} flex flex-col hover:z-20`}
      style={{
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
        {`${formatTime(event.start)} - ${formatTime(event.end)}`}
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

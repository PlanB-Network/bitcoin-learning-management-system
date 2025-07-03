import { format } from 'date-fns';
import { useState } from 'react';
import type { EventProps } from 'react-big-calendar';

import type { CalendarEvent } from './calendar-event.js';

type CustomEventProps = EventProps<CalendarEvent>;

export const CustomEventWeek = ({ event }: CustomEventProps) => {
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
      className={`${cssClasses}`}
      style={{
        // maxHeight: `${isSelected ? '100%' : ''}`,
        height: `${isSelected ? 'fit-content' : '100%'}`,
        overflow: `${isSelected ? 'hidden' : 'hidden'}`,
        padding: '10px',
        paddingLeft: 8,
        paddingTop: 8,
        width: '100%',
      }}
      onPointerEnter={() => {
        setIsSelected(!isSelected);
      }}
      onPointerLeave={() => {
        setIsSelected(!isSelected);
      }}
    >
      <div className="flex flex-row text-sm pl-1">
        {`${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}
      </div>
      <div className="font-semibold text-sm">{event.title}</div>
      <div className="text-sm">{event.organizer}</div>
      <div className="text-sm">{event.addressLine1}</div>
    </div>
  );
};

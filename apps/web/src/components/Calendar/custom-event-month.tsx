import { format } from 'date-fns';
import { useState } from 'react';
import type { EventProps } from 'react-big-calendar';
import { FaVideo } from 'react-icons/fa';

import type { CalendarEvent } from './calendar-event.ts';

type CustomEventProps = EventProps<CalendarEvent>;

export const CustomEventMonth = ({ event }: CustomEventProps) => {
  const [isSelected, setIsSelected] = useState(false);

  let cssclasses: string;

  switch (event.type) {
    case 'lecture': {
      cssclasses = 'bg-yellow-6 text-yellow-1';
      break;
    }
    case 'conference': {
      cssclasses = 'bg-[#f2eae5] text-darkOrange-7';
      break;
    }
    case 'exam': {
      cssclasses = 'bg-red-1 text-red-5';
      break;
    }
    case 'meetups': {
      cssclasses = 'bg-darkGreen-6 text-darkGreen-1';
      break;
    }
    case 'course': {
      cssclasses = 'bg-darkOrange-0 text-darkOrange-5';
      break;
    }
    default: {
      cssclasses = 'bg-darkGreen-6 text-darkGreen-1';
      break;
    }
  }
  console.log('Event:', event);

  return (
    <div
      className={`${cssclasses} flex flex-col h-[30px] hover:h-full hover:z-20 hover:absolute hover:top-0 hover:w-fit hover:max-w-[220px]`}
      style={{
        padding: '10px',
        width: '100%',
        paddingLeft: 8,
        paddingTop: 8,
        overflow: `${isSelected ? 'visible' : 'hidden'}`,
      }}
      onPointerEnter={() => setIsSelected(!isSelected)}
      onPointerLeave={() => setIsSelected(!isSelected)}
    >
      <div
        className={`flex flex-row text-sm pl-1 ${isSelected ? 'order-1' : 'order-2'}`}
      >
        {`${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}
        {event.isOnline && (
          <FaVideo className="size-6 ml-auto bg-white p-1 rounded-lg" />
        )}
      </div>
      <div className="font-semibold text-sm whitespace-normal w-full">
        {event.title}
      </div>
      <div className="text-sm whitespace-normal w-full">{event.organiser}</div>
      <div className="text-sm whitespace-normal w-full">
        {event.addressLine1}
      </div>
    </div>
  );
};

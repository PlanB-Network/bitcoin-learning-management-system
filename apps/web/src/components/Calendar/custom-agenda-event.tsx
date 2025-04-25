import { format } from 'date-fns';
import { useState } from 'react';
import type { EventProps } from 'react-big-calendar';
import { FaVideo } from 'react-icons/fa';

import type { CalendarEvent } from './calendar-event.js';

type CustomAgendaEventProps = EventProps<CalendarEvent>;

export const CustomAgendaEvent = ({ event }: CustomAgendaEventProps) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div
      className="md:ml-2 md:mt-2"
      style={{
        padding: '10px',
        width: '100%',
        height: `${isSelected ? 'fit-content' : '100%'}`,
        paddingLeft: 0,
        paddingTop: 0,
        overflow: `${isSelected ? 'hidden' : 'hidden'}`,
      }}
      onPointerEnter={() => {
        setIsSelected(!isSelected);
      }}
      onPointerLeave={() => {
        setIsSelected(!isSelected);
      }}
    >
      <div className="flex flex-row text-sm">
        <div className="font-semibold text-sm">{event.title}</div>
        {event.isOnline && (
          <FaVideo className="size-6 ml-auto bg-white p-1 rounded-lg" />
        )}
      </div>

      <div className="text-sm">{event.organizer}</div>
      <div className="text-sm">{event.addressLine1}</div>
      <div className="text-sm mt-1">
        {`${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}
      </div>
    </div>
  );
};

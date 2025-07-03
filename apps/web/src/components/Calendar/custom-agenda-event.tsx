import { format, isSameDay } from 'date-fns';
import { useState } from 'react';
import type { EventProps } from 'react-big-calendar';
import type { CalendarEvent } from './calendar-event.js';

type CustomAgendaEventProps = EventProps<CalendarEvent>;

export const CustomAgendaEvent = ({ event }: CustomAgendaEventProps) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div
      className="md:ml-2 md:mt-2"
      style={{
        height: `${isSelected ? 'fit-content' : '100%'}`,
        overflow: 'hidden',
        padding: '10px',
        paddingLeft: 0,
        paddingTop: 0,
        width: '100%',
      }}
      onPointerEnter={() => setIsSelected(true)}
      onPointerLeave={() => setIsSelected(false)}
    >
      <div className="flex flex-row text-sm">
        <div className="font-semibold text-sm">{event.title}</div>
      </div>

      <div className="text-sm">{event.organizer}</div>
      <div className="text-sm">{event.addressLine1}</div>

      {isSameDay(event.start, event.end) && (
        <div className="text-sm mt-1">
          {`${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}
        </div>
      )}
    </div>
  );
};

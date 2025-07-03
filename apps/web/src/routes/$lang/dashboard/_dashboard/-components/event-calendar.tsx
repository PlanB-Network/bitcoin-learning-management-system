import { useNavigate } from '@tanstack/react-router';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useEffect, useState } from 'react';
import type {
  Components,
  DateLocalizer,
  DateRange,
  Formats,
  View,
} from 'react-big-calendar';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { CalendarEvent } from '#src/components/Calendar/calendar-event.js';
import { customEventGetter } from '#src/components/Calendar/custom-event-getter.js';
import { CustomEventMonth } from '#src/components/Calendar/custom-event-month.js';
import { CustomEventWeek } from '#src/components/Calendar/custom-event-week.tsx';
import CustomToolbar from '#src/components/Calendar/custom-toolbar.js';
import { CustomWeekHeader } from '#src/components/Calendar/custom-week-header.js';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CustomAgendaEvent } from '#src/components/Calendar/custom-agenda-event.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';

export const EventCalendar = ({ events }: { events: CalendarEvent[] }) => {
  const navigate = useNavigate();

  const isMobile = useSmaller('md');

  const [currentView, setCurrentView] = useState<View>(() =>
    isMobile ? Views.MONTH : Views.WEEK,
  );

  useEffect(() => {
    const targetView = isMobile ? Views.MONTH : Views.WEEK;
    if (targetView !== currentView) {
      setCurrentView(targetView);
    }
  }, [isMobile]);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const locales = {
    'en-US': enUS,
  };

  const localizer = dateFnsLocalizer({
    format,
    getDay,
    locales,
    parse,
    startOfWeek,
  });

  const weekComponents: Components<CalendarEvent> = {
    event: CustomEventWeek,
    toolbar: CustomToolbar,
    week: {
      header: CustomWeekHeader,
    },
  };

  const monthComponents: Components<CalendarEvent> = {
    event: CustomEventMonth,
    toolbar: CustomToolbar,
  };

  const agendaComponents: Components<CalendarEvent> = {
    agenda: {
      event: CustomAgendaEvent,
    },
    toolbar: CustomToolbar,
  };

  const scrollToTime = new Date(1970, 1, 1, 9);

  const formats: Formats = {
    agendaDateFormat: (date: Date, culture?: string, local?: DateLocalizer) =>
      local?.format(date, 'eee MMM d', culture || 'en-US') || '',

    agendaTimeRangeFormat: (
      range: DateRange,
      culture?: string,
      local?: DateLocalizer,
    ) => `${local?.format(range.start, 'h:mm a', culture || 'en-US')}` || '',
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      views={['week', 'month', 'agenda']}
      onView={handleViewChange}
      view={currentView}
      onSelectEvent={(e) => {
        switch (e.type) {
          case 'class': {
            navigate({
              params: { chapterId: e.subId!, courseId: e.id },
              to: '/courses/$courseId/$chapterId',
            });
            break;
          }
          default: {
            navigate({
              params: { eventId: e.id },
              to: '/events/$eventId',
            });
            break;
          }
        }
      }}
      style={{
        height: '829px',
        width: '100%',
      }}
      eventPropGetter={customEventGetter}
      formats={formats}
      components={
        currentView === 'month'
          ? monthComponents
          : currentView === 'agenda'
            ? agendaComponents
            : weekComponents
      }
      scrollToTime={scrollToTime}
      showAllEvents={true}
    />
  );
};

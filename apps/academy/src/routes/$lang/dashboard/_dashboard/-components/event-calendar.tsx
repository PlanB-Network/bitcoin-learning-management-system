import { useNavigate } from '@tanstack/react-router';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useEffect, useMemo, useState } from 'react';
import type {
  Components,
  DateLocalizer,
  DateRange,
  Formats,
  View,
} from 'react-big-calendar';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();

  const isMobile = useSmaller('md');

  const [currentView, setCurrentView] = useState<View>(() =>
    isMobile ? Views.MONTH : Views.WEEK,
  );

  const [currentDate, setCurrentDate] = useState(new Date());

  const onNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  useEffect(() => {
    const targetView = isMobile ? Views.MONTH : Views.WEEK;
    if (targetView !== currentView) {
      setCurrentView(targetView);
    }
  }, [isMobile]);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        getDay,
        locales: {
          'en-US': enUS,
        },
        parse,
        startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
      }),
    [],
  );

  const weekComponents: Components<CalendarEvent> = useMemo(
    () => ({
      event: CustomEventWeek,
      toolbar: CustomToolbar,
      week: {
        header: CustomWeekHeader,
      },
    }),
    [],
  );

  const monthComponents: Components<CalendarEvent> = useMemo(
    () => ({
      event: CustomEventMonth,
      toolbar: CustomToolbar,
    }),
    [],
  );

  const agendaComponents: Components<CalendarEvent> = useMemo(
    () => ({
      agenda: {
        event: CustomAgendaEvent,
      },
      toolbar: CustomToolbar,
    }),
    [],
  );

  const scrollToTime = new Date(1970, 1, 1, 9);

  const formats: Formats = useMemo(
    () => ({
      agendaDateFormat: (date: Date, culture?: string, local?: DateLocalizer) =>
        local?.format(date, 'eee MMM d', culture || i18n.language) || '',

      agendaTimeRangeFormat: (
        range: DateRange,
        culture?: string,
        local?: DateLocalizer,
      ) =>
        `${local?.format(range.start, 'h:mm a', culture || i18n.language)}` ||
        '',

      weekdayFormat: (date: Date, culture?: string) =>
        new Intl.DateTimeFormat(culture || i18n.language, {
          weekday: isMobile ? 'narrow' : 'long',
        }).format(date),

      dayFormat: (date: Date, culture?: string) =>
        new Intl.DateTimeFormat(culture || i18n.language, {
          weekday: 'short',
          day: 'numeric',
        }).format(date),
    }),
    [i18n.language, isMobile],
  );

  const messages = useMemo(
    () => ({
      today: t('events.calendar.today'),
      previous: t('words.previous'),
      next: t('words.next'),
      month: t('words.month'),
      week: t('words.week'),
      agenda: t('words.agenda'),
      date: t('words.date'),
      time: t('words.time'),
      event: t('words.event'),
      noEventsInRange: t('events.calendar.noEventsFound'),
    }),
    [t],
  );

  return (
    <Calendar
      localizer={localizer}
      events={events}
      views={['week', 'month', 'agenda']}
      onView={handleViewChange}
      view={currentView}
      date={currentDate}
      onNavigate={onNavigate}
      formats={formats}
      messages={messages}
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
      components={
        currentView === 'month'
          ? monthComponents
          : currentView === 'agenda'
            ? agendaComponents
            : weekComponents
      }
      scrollToTime={scrollToTime}
      showAllEvents={true}
      showMultiDayTimes={true}
    />
  );
};

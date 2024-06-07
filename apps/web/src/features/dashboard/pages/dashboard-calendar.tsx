import { useNavigate } from '@tanstack/react-router';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useEffect, useState } from 'react';
import type { Components, View } from 'react-big-calendar';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { useTranslation } from 'react-i18next';

import type { CalendarEvent } from '#src/components/Calendar/calendar-event.js';
import { customEventGetter } from '#src/components/Calendar/custom-event-getter.js';
import { CustomEvent } from '#src/components/Calendar/custom-event.js';
import CustomToolbar from '#src/components/Calendar/custom-toolbar.js';
import { CustomWeekHeader } from '#src/components/Calendar/custom-week-header.js';
import { useGreater } from '#src/hooks/use-greater.js';

import { trpc } from '../../../utils/index.ts';
import { DashboardLayout } from '../layout.tsx';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export const DashboardCalendar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: session } = trpc.user.getSession.useQuery();
  if (!session) {
    navigate({ to: '/' });
  }

  const isScreenMd = useGreater('md');

  const [currentView, setCurrentView] = useState<View>(
    isScreenMd ? Views.WEEK : Views.AGENDA,
  );

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const { data: allEvents } = trpc.user.calendar.getCalendarEvents.useQuery({
    language: i18n.language ?? 'en',
  });
  const [events, setEvents] = useState<CalendarEvent[]>();

  useEffect(() => {
    if (allEvents) {
      const ev: CalendarEvent[] = allEvents?.map((e) => ({
        title: e.name,
        type: e.type,
        id: e.id,
        subId: e.subId,
        addressLine1: e.addressLine1,
        organiser: e.organiser,
        start: e.startDate!,
        end: e.endDate!,
        isOnline: e.isOnline,
      }));

      if (ev) {
        setEvents(ev);
      }
    }
  }, [allEvents]);

  const locales = {
    'en-US': enUS,
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  const weekComponents: Components<CalendarEvent> = {
    toolbar: CustomToolbar,
    event: CustomEvent,
    week: {
      header: CustomWeekHeader,
    },
  };

  const monthComponents: Components<CalendarEvent> = {
    toolbar: CustomToolbar,
  };

  const scrollToTime = new Date(1970, 1, 1, 9);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        <div className="text-2xl">
          {t('dashboard.calendar.personalCalendar')}
        </div>
        <Calendar
          localizer={localizer}
          events={events}
          views={['week', 'month', 'agenda']}
          onView={handleViewChange}
          defaultView={currentView}
          onSelectEvent={(e) => {
            // eslint-disable-next-line sonarjs/no-small-switch
            switch (e.type) {
              case 'course': {
                navigate({
                  to: '/courses/$courseId/$chapterId',
                  params: { courseId: e.id, chapterId: e.subId! },
                });
                break;
              }
              default: {
                navigate({
                  to: '/events/$eventId',
                  params: { eventId: e.id },
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
            currentView === 'month' ? monthComponents : weekComponents
          }
          scrollToTime={scrollToTime}
          showAllEvents={true}
        />
      </div>
    </DashboardLayout>
  );
};

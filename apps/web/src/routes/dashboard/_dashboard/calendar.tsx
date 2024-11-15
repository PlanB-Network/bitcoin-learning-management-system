import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useContext, useEffect, useState } from 'react';
import type { Components, View } from 'react-big-calendar';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { useTranslation } from 'react-i18next';

import { cn } from '@blms/ui';

import type { CalendarEvent } from '#src/components/Calendar/calendar-event.js';
import { customEventGetter } from '#src/components/Calendar/custom-event-getter.js';
import { CustomEventMonth } from '#src/components/Calendar/custom-event-month.js';
import { CustomEvent } from '#src/components/Calendar/custom-event.js';
import CustomToolbar from '#src/components/Calendar/custom-toolbar.js';
import { CustomWeekHeader } from '#src/components/Calendar/custom-week-header.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

type CourseType =
  | 'course'
  | 'lecture'
  | 'conference'
  | 'exam'
  | 'meetup'
  | 'workshop';

export const Route = createFileRoute('/dashboard/_dashboard/calendar')({
  component: DashboardCalendar,
});

function DashboardCalendar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const courseTypes: CourseType[] = [
    'course',
    'lecture',
    'conference',
    'exam',
    'meetup',
  ];

  const courseColor = ['#FF5C00', '#FF9401', '#AD3F00', '#E00000', '#42A86B'];

  const { data: allEvents } = trpc.user.calendar.getCalendarEvents.useQuery({
    language: i18n.language ?? 'en',
    upcomingEvents: true,
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

  const [filter, setFilter] = useState<CourseType[]>([
    'course',
    'lecture',
    'conference',
    'exam',
    'meetup',
  ]);

  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>();

  useEffect(() => {
    if (!events || filter.length === 0) {
      setFilteredEvents([]);
      return;
    }

    setFilteredEvents(
      events &&
        events.filter((e) =>
          filter.length > 0 ? filter.includes(e.type! as CourseType) : true,
        ),
    );
  }, [events, filter, filter.length]);

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
    event: CustomEventMonth,
  };

  const scrollToTime = new Date(1970, 1, 1, 9);

  return (
    <div className="flex flex-col gap-4 lg:gap-8 h-full">
      <h3 className="text-2xl max-md:px-6">
        {t('dashboard.calendar.personalCalendar')}
      </h3>

      <div className="hidden max-md:px-6 lg:flex">
        {courseTypes.map((f, index) => (
          <button
            key={f}
            style={
              filter.includes(f)
                ? {
                    backgroundColor: `${courseColor[index]}`,
                    color: `white`,
                    fontWeight: 600,
                    paddingTop: '8px',
                    paddingBottom: '8px',
                  }
                : {
                    color: `${courseColor[index]}`,
                    borderColor: `${courseColor[index]}`,
                    borderWidth: `2px`,
                    paddingTop: '6px',
                    paddingBottom: '6px',
                  }
            }
            className={cn(
              'leading-snug mx-1 px-4 capitalize rounded-xl',
              filter.includes(f)
                ? 'hover:brightness-110'
                : 'hover:bg-newGray-5',
            )}
            onClick={() =>
              setFilter((prev) =>
                prev.length === courseTypes.length
                  ? [f]
                  : prev.includes(f)
                    ? prev.filter((p) => p !== f)
                    : [...prev, f],
              )
            }
          >
            {f}s
            <span
              className="ml-2 bg-white rounded-md py-1 px-[6px] text-xs border-gray font-medium"
              style={{
                color: `${courseColor[index]}`,
                borderWidth: filter.includes(f) ? '' : '1px',
              }}
            >
              {events?.filter((p) => p.type === f).length}
            </span>
          </button>
        ))}
      </div>

      <Calendar
        localizer={localizer}
        events={filteredEvents}
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
        components={currentView === 'month' ? monthComponents : weekComponents}
        scrollToTime={scrollToTime}
        showAllEvents={true}
      />
    </div>
  );
}

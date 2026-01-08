import { cn, Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FilterIcon from '#src/assets/icons/Filter-black.svg';
import type { CalendarEvent } from '#src/components/Calendar/calendar-event.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '#src/components/page-layout.tsx';
// import { generateIcs } from '#src/utils/ics.ts';
import { EventCalendar } from '../dashboard/-components/event-calendar.tsx';

type CalenderEventType = 'class' | 'event';

export const Route = createFileRoute('/$lang/calendar/')({
  component: DashboardCalendar,
});

function DashboardCalendar() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { session } = useContext(AppContext);

  const courseTypes: CalenderEventType[] = ['class', 'event'];

  const courseColor = ['#FF5C00', '#AD3F00'];

  const [filter, setFilter] = useState<CalenderEventType[]>(['class', 'event']);

  const { data: events } = useQuery(
    trpc.user.calendar.getCalendarEvents.queryOptions({
      upcomingEvents: true,
      userSpecific: true,
    }),
  );

  const filteredEvents = useMemo(() => {
    return (
      events
        ?.filter((e) =>
          filter.length > 0
            ? filter.includes(e.type as CalenderEventType)
            : false,
        )
        .map<CalendarEvent>((e) => ({
          addressLine1: e.addressLine1,
          end: e.endDate!,
          id: e.id,
          isOnline: e.isOnline,
          organizer: e.organizer,
          start: e.startDate!,
          subId: e.subId,
          title: e.name,
          type: e.type,
        })) ?? []
    );
  }, [events, filter]);

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  // const downloadIcs = () => {
  //   if (!events) {
  //     return;
  //   }

  //   const icsContent = generateIcs(filteredEvents);
  //   const blob = new Blob([icsContent], {
  //     type: 'text/calendar;charset=utf-8',
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.setAttribute('download', 'calendar-plan-b-academy.ics');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // };

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      title={t('dashboard.calendar.personalCalendar')}
      layoutSize="max"
      // actionButtons={[
      //   {
      //     text: t('dashboard.calendar.downloadIcs'),
      //     onClick: downloadIcs,
      //   },
      // ]}
    >
      <div className="flex flex-col w-full gap-4">
        <div className="hidden max-md:px-6 lg:flex">
          <img className="size-10" src={FilterIcon} alt="" />

          {courseTypes.map((filterName, index) => (
            <button
              key={filterName}
              type="button"
              onClick={() =>
                setFilter((prev) =>
                  prev.length === courseTypes.length
                    ? [filterName]
                    : prev.includes(filterName)
                      ? prev.filter((p) => p !== filterName)
                      : [...prev, filterName],
                )
              }
              style={
                filter.includes(filterName)
                  ? {
                      backgroundColor: `${courseColor[index]}`,
                      color: 'white',
                      fontWeight: 600,
                      paddingBottom: '8px',
                      paddingTop: '8px',
                    }
                  : {
                      borderColor: `${courseColor[index]}`,
                      borderWidth: '2px',
                      color: `${courseColor[index]}`,
                      paddingBottom: '6px',
                      paddingTop: '6px',
                    }
              }
              className={cn(
                'leading-snug mx-1 px-4 capitalize rounded-xl',
                filter.includes(filterName)
                  ? 'hover:brightness-110'
                  : 'hover:bg-neutral-100',
              )}
            >
              {t(`dashboard.calendar.eventType.${filterName}`)}
              <span
                className="ml-2 bg-white rounded-md py-1 px-1.5 text-xs border-gray font-medium"
                style={{
                  borderWidth: filter.includes(filterName) ? '' : '1px',
                  color: `${courseColor[index]}`,
                }}
              >
                {events?.filter((p) => p.type === filterName).length}
              </span>
            </button>
          ))}
        </div>

        <EventCalendar events={filteredEvents ?? []} />
      </div>
    </PageLayout>
  );
}

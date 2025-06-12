import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader, cn } from '@blms/ui';

import FilterIcon from '#src/assets/icons/Filter-black.svg';
import type { CalendarEvent } from '#src/components/Calendar/calendar-event.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import { EventCalendar } from './-components/event-calendar.tsx';

type CalenderEventType = 'class' | 'event';

export const Route = createFileRoute('/$lang/dashboard/_dashboard/calendar')({
  component: DashboardCalendar,
});

function DashboardCalendar() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { session } = useContext(AppContext);

  const courseTypes: CalenderEventType[] = ['class', 'event'];

  const courseColor = ['#FF5C00', '#AD3F00'];

  const { data: events } = useQuery(
    trpc.user.calendar.getCalendarEvents.queryOptions(
      { upcomingEvents: true, userSpecific: true },
      {
        select: (allEvents) =>
          allEvents
            ?.filter((e) =>
              filter.length > 0
                ? filter.includes(e.type as CalenderEventType)
                : true,
            )
            .map<CalendarEvent>((e) => ({
              title: e.name,
              type: e.type,
              id: e.id,
              subId: e.subId,
              addressLine1: e.addressLine1,
              organizer: e.organizer,
              start: e.startDate!,
              end: e.endDate!,
              isOnline: e.isOnline,
            })),
      },
    ),
  );

  const [filter, setFilter] = useState<CalenderEventType[]>(['class', 'event']);

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-8 h-full">
      <h3 className="text-2xl max-md:px-6">
        {t('dashboard.calendar.personalCalendar')}
      </h3>

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
                    paddingTop: '8px',
                    paddingBottom: '8px',
                  }
                : {
                    color: `${courseColor[index]}`,
                    borderColor: `${courseColor[index]}`,
                    borderWidth: '2px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                  }
            }
            className={cn(
              'leading-snug mx-1 px-4 capitalize rounded-xl',
              filter.includes(filterName)
                ? 'hover:brightness-110'
                : 'hover:bg-newGray-5',
            )}
          >
            {t(`dashboard.calendar.eventType.${filterName}`)}
            <span
              className="ml-2 bg-white rounded-md py-1 px-[6px] text-xs border-gray font-medium"
              style={{
                color: `${courseColor[index]}`,
                borderWidth: filter.includes(filterName) ? '' : '1px',
              }}
            >
              {events?.filter((p) => p.type === filterName).length}
            </span>
          </button>
        ))}
      </div>

      <EventCalendar events={events ?? []} />
    </div>
  );
}

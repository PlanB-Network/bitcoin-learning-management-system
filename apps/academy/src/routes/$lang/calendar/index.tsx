import { cn, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CalendarEvent } from '#src/components/Calendar/calendar-event.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  CalendarDownloadModal,
  type CalenderEventType,
} from '#src/components/Calendar/calendar-download-modal.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { copyCalendarUrl, downloadIcs } from '#src/utils/calendar.ts';
import { EventCalendar } from '../dashboard/-components/event-calendar.tsx';

export const Route = createFileRoute('/$lang/calendar/')({
  component: DashboardCalendar,
});

function DashboardCalendar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { session, user } = useContext(AppContext);

  const calendarEventType: CalenderEventType[] = ['class', 'event', 'history'];

  const courseColor = ['#FF5C00', '#0A69DA', '#EAE4E1'];

  const [filter, setFilter] = useState<CalenderEventType[]>([
    'class',
    'event',
    'history',
  ]);
  const [icsFilters, setIcsFilters] = useState<CalenderEventType[]>([
    'class',
    'event',
    'history',
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: events } = useQuery(
    trpc.user.calendar.getCalendarEvents.queryOptions({
      upcomingEvents: false,
      userSpecific: true,
      language: i18n.language,
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
        .map<CalendarEvent>((e) => {
          let startDate = e.startDate!;
          let endDate = e.endDate!;

          if (e.type === 'history') {
            const currentYear = new Date().getFullYear();
            startDate = new Date(startDate);
            startDate.setFullYear(currentYear);
            endDate = new Date(endDate);
            endDate.setFullYear(currentYear);
          }

          return {
            addressLine1: e.addressLine1,
            allDay: e.type === 'history',
            end: endDate,
            id: e.id,
            isOnline: e.isOnline,
            organizer: e.organizer,
            start: startDate,
            subId: e.subId,
            title: e.name,
            type: e.type,
          };
        }) ?? []
    );
  }, [events, filter]);

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  const handleDownloadIcs = (modalFilters: CalenderEventType[]) => {
    downloadIcs({
      events: events ?? [],
      modalFilters,
      filename: 'calendar-plan-b-academy.ics',
    });
  };

  const handleCopyCalendarUrl = async (modalFilters: CalenderEventType[]) => {
    return copyCalendarUrl({
      token: user?.calendarToken,
      modalFilters,
      language: i18n.language,
      origin: window.location.origin,
    });
  };

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      title={t('dashboard.calendar.personalCalendar')}
      layoutSize="max"
      actionButtons={[
        {
          text: t('dashboard.calendar.downloadCalendar'),
          onClick: () => setIsModalOpen(true),
        },
      ]}
    >
      <div className="flex flex-col w-full gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {calendarEventType.map((filterName, index) => (
            <button
              key={filterName}
              type="button"
              onClick={() =>
                setFilter((prev) =>
                  prev.includes(filterName)
                    ? prev.filter((p) => p !== filterName)
                    : [...prev, filterName],
                )
              }
              style={
                filter.includes(filterName)
                  ? {
                      backgroundColor: `${courseColor[index]}`,
                      borderColor: `${courseColor[index]}`,
                    }
                  : {
                      borderColor: `${courseColor[index]}`,
                      color:
                        filterName === 'history'
                          ? '#49372C'
                          : `${courseColor[index]}`,
                    }
              }
              className={cn(
                'body-base-bold rounded-full px-2.5 py-1.5 border-2',
                filter.includes(filterName)
                  ? filterName === 'history'
                    ? 'text-brown-800'
                    : 'text-white border-transparent'
                  : 'border-brown-200',
              )}
            >
              {t(`dashboard.calendar.eventType.${filterName}`)}
              <span
                className="ml-2.5 body-extra-small-bold px-1.5 py-px rounded-full"
                style={{
                  color: filter.includes(filterName)
                    ? filterName === 'history'
                      ? '#49372C'
                      : `${courseColor[index]}`
                    : filterName === 'history'
                      ? '#49372C'
                      : 'white',
                  backgroundColor: filter.includes(filterName)
                    ? 'white'
                    : `${courseColor[index]}`,
                }}
              >
                {
                  events?.filter((p) => {
                    if (p.type !== filterName) {
                      return false;
                    }

                    if (p.type === 'history') {
                      return true;
                    }

                    return p.startDate >= new Date();
                  }).length
                }
              </span>
            </button>
          ))}
        </div>

        <EventCalendar events={filteredEvents ?? []} />
      </div>

      <CalendarDownloadModal
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        onDownload={handleDownloadIcs}
        onSubscribe={handleCopyCalendarUrl}
        filters={icsFilters}
        setFilters={setIcsFilters}
        eventTypes={calendarEventType}
      />
    </PageLayout>
  );
}

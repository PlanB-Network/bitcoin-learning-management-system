import {
  BasicModal,
  Button,
  Checkbox,
  cn,
  customToast,
  DividerSimple,
  Loader,
} from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCopy, TbCopyCheck, TbDownload } from 'react-icons/tb';

import type { CalendarEvent } from '#src/components/Calendar/calendar-event.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { generateIcs } from '@blms/shared';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { EventCalendar } from '../dashboard/-components/event-calendar.tsx';

type CalenderEventType = 'class' | 'event' | 'history';

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

  const downloadIcs = (modalFilters: CalenderEventType[]) => {
    if (!events) {
      return;
    }

    const icsContent = generateIcs(
      events.filter((e) => modalFilters.includes(e.type as CalenderEventType)),
    );
    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'calendar-plan-b-academy.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyCalendarUrl = async (modalFilters: CalenderEventType[]) => {
    const token = user?.calendarToken;
    if (!token) return false;

    const url = `${window.location.origin}/api/calendar/${token}.ics${
      modalFilters.length > 0 ? `?types=${modalFilters.join(',')}` : ''
    }${modalFilters.length > 0 ? '&' : '?'}language=${i18n.language}`;

    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy calendar URL to clipboard.', error);
      customToast('Failed to copy the calendar URL.', {
        color: 'warning',
      });
      return false;
    }
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
        onDownload={downloadIcs}
        onSubscribe={copyCalendarUrl}
        filters={icsFilters}
        setFilters={setIcsFilters}
        eventTypes={calendarEventType}
      />
    </PageLayout>
  );
}

interface CalendarDownloadModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onDownload: (filters: CalenderEventType[]) => void;
  // biome-ignore lint/suspicious/noConfusingVoidType: ok
  onSubscribe: (filters: CalenderEventType[]) => Promise<boolean | void>;
  filters: CalenderEventType[];
  setFilters: React.Dispatch<React.SetStateAction<CalenderEventType[]>>;
  eventTypes: CalenderEventType[];
}

const CalendarDownloadModal = ({
  isOpen,
  onClose,
  onDownload,
  onSubscribe,
  filters,
  setFilters,
  eventTypes,
}: CalendarDownloadModalProps) => {
  const isMobile = useSmaller('md');

  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const handleSubscribe = async () => {
    const success = await onSubscribe(filters);
    if (success !== false) {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const toggleFilter = useCallback(
    (filterName: CalenderEventType) => {
      setFilters((prev) =>
        prev.includes(filterName)
          ? prev.filter((p) => p !== filterName)
          : [...prev, filterName],
      );
    },
    [setFilters],
  );

  return (
    <BasicModal
      open={isOpen}
      onOpenChange={onClose}
      title={t('dashboard.calendar.downloadCalendarTitle')}
    >
      <div className="w-full flex flex-col gap-6 text-left">
        <div className="flex flex-col gap-3">
          <h3 className="label-strong">
            {t('dashboard.calendar.followSelectedCalendar')}
          </h3>
          <div className="flex items-center flex-wrap gap-6">
            {eventTypes.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`checkbox-${type}`}
                  checked={filters.includes(type)}
                  onCheckedChange={() => toggleFilter(type)}
                />
                <label
                  htmlFor={`checkbox-${type}`}
                  className="body-large cursor-pointer"
                >
                  {t(`dashboard.calendar.eventType.${type}`)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="label-strong">
            {t('dashboard.calendar.subscribeTitle')}
          </h3>
          <ul className="body-base list-disc list-inside">
            <li>{t('dashboard.calendar.subscribeStep1')}</li>
            <li>{t('dashboard.calendar.subscribeStep2')}</li>
            <li>{t('dashboard.calendar.subscribeStep3')}</li>
          </ul>
        </div>

        <Button
          variant="primary"
          size={isMobile ? 'm' : 'l'}
          onClick={handleSubscribe}
          className="w-full gap-2"
        >
          {t('dashboard.calendar.subscribeButton')}
          {isCopied ? <TbCopyCheck size={24} /> : <TbCopy size={24} />}
        </Button>

        <DividerSimple />

        <div className="flex flex-col gap-3">
          <h3 className="label-strong">
            {t('dashboard.calendar.downloadTitle')}
          </h3>
          <ul className="body-base list-disc list-inside">
            <li>{t('dashboard.calendar.downloadStep1')}</li>
            <li>{t('dashboard.calendar.downloadStep2')}</li>
            <li>{t('dashboard.calendar.downloadStep3')}</li>
          </ul>
        </div>

        <Button
          variant="newTertiary"
          size={isMobile ? 'm' : 'l'}
          onClick={() => onDownload(filters)}
          className="w-full gap-2"
        >
          {t('dashboard.calendar.downloadButton')}
          <TbDownload size={24} />
        </Button>
      </div>
    </BasicModal>
  );
};

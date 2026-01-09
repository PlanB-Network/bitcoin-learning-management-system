import {
  BasicModal,
  Button,
  cn,
  customToast,
  DividerSimple,
  Loader,
} from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCheck, TbDownload, TbLink } from 'react-icons/tb';

import FilterIcon from '#src/assets/icons/Filter-black.svg';
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

type CalenderEventType = 'class' | 'event';

export const Route = createFileRoute('/$lang/calendar/')({
  component: DashboardCalendar,
});

function DashboardCalendar() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { session, user } = useContext(AppContext);

  const courseTypes: CalenderEventType[] = ['class', 'event'];

  const courseColor = ['#FF5C00', '#AD3F00'];

  const [filter, setFilter] = useState<CalenderEventType[]>(['class', 'event']);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: events } = useQuery(
    trpc.user.calendar.getCalendarEvents.queryOptions({
      upcomingEvents: false,
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

  const downloadIcs = () => {
    if (!events) {
      return;
    }

    const icsContent = generateIcs(
      events.filter((e) => filter.includes(e.type as CalenderEventType)),
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

  const copyCalendarUrl = async () => {
    const token = user?.calendarToken;
    if (!token) return false;

    const url = `${window.location.origin}/api/calendar/${token}.ics${
      filter.length > 0 ? `?types=${filter.join(',')}` : ''
    }`;

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

      <CalendarDownloadModal
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        onDownload={downloadIcs}
        onSubscribe={copyCalendarUrl}
      />
    </PageLayout>
  );
}

interface CalendarDownloadModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onDownload: () => void;
  onSubscribe: () => Promise<boolean | void>;
}

const CalendarDownloadModal = ({
  isOpen,
  onClose,
  onDownload,
  onSubscribe,
}: CalendarDownloadModalProps) => {
  const isMobile = useSmaller('md');

  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);

  const handleSubscribe = async () => {
    const success = await onSubscribe();
    if (success !== false) {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
    <BasicModal
      open={isOpen}
      onOpenChange={onClose}
      title={t('dashboard.calendar.downloadCalendarTitle')}
    >
      <div className="w-full flex flex-col gap-6 text-left">
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
          {isCopied ? <TbCheck size={24} /> : <TbLink size={24} />}
          {t('dashboard.calendar.subscribeButton')}
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
          onClick={onDownload}
          className="w-full gap-2"
        >
          <TbDownload size={24} />
          {t('dashboard.calendar.downloadButton')}
        </Button>
      </div>
    </BasicModal>
  );
};

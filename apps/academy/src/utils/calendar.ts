import { generateIcs } from '@blms/shared';
import { customToast } from '@blms/ui';
import type { CalenderEventType } from '#src/components/Calendar/calendar-download-modal.tsx';

interface DownloadIcsOptions {
  events: any[];
  modalFilters: CalenderEventType[];
  filename?: string;
}

export const downloadIcs = ({
  events,
  modalFilters,
  filename = 'calendar.ics',
}: DownloadIcsOptions) => {
  if (!events || events.length === 0) {
    return;
  }

  const filteredEvents = events.filter((e) =>
    modalFilters.includes(e.type as CalenderEventType),
  );

  if (filteredEvents.length === 0) {
    return;
  }

  const icsContent = generateIcs(filteredEvents);
  const blob = new Blob([icsContent], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface CopyCalendarUrlOptions {
  token?: string;
  modalFilters: CalenderEventType[];
  language: string;
  courseId?: string;
  origin: string;
}

export const copyCalendarUrl = async ({
  token,
  modalFilters,
  language,
  courseId,
  origin,
}: CopyCalendarUrlOptions) => {
  if (!token) return false;

  const baseUrl = `${origin}/api/calendar/${token}.ics`;
  const params = new URLSearchParams();

  if (courseId) {
    params.append('courseId', courseId);
  }

  if (modalFilters.length > 0) {
    params.append('types', modalFilters.join(','));
  }

  params.append('language', language);

  const url = `${baseUrl}?${params.toString()}`;

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

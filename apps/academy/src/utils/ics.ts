import type { CalendarEvent } from '#src/components/Calendar/calendar-event.ts';

const formatIcsDate = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

const escapeSpecialChars = (str: string) => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

export const generateIcs = (events: CalendarEvent[]) => {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Plan B Academy//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
  ];

  const body = events.flatMap((event) => [
    'BEGIN:VEVENT',
    `UID:${event.id}-${event.subId || ''}-${event.start.getTime()}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(event.start)}`,
    `DTEND:${formatIcsDate(event.end)}`,
    `SUMMARY:${escapeSpecialChars(event.title || 'No Title')}`,
    `DESCRIPTION:${escapeSpecialChars(event.organizer || '')}`,
    `LOCATION:${escapeSpecialChars(event.addressLine1 || '')}`,
    'END:VEVENT',
  ]);

  const footer = ['END:VCALENDAR'];

  return [...header, ...body, ...footer].join('\r\n');
};

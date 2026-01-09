import type { CalendarEvent } from '@blms/types';

const formatIcsDate = (date: Date) => {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
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
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Plan B Academy',
    'X-WR-TIMEZONE:UTC',
  ];

  const body = events.flatMap((event) => {
    const startDate = event.startDate;
    const endDate = event.endDate || new Date(startDate.getTime() + 3600000); // Default 1 hour if no end date

    const uid = event.subId
      ? `event-${event.id}-${event.subId}@plan-b-academy`
      : `event-${event.id}@plan-b-academy`;

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${escapeSpecialChars(event.name || 'No title')}`,
      `DESCRIPTION:${escapeSpecialChars(event.organizer || '')}`,
      `LOCATION:${escapeSpecialChars(event.addressLine1 || '')}`,
      'END:VEVENT',
    ];
  });

  const footer = ['END:VCALENDAR'];

  return [...header, ...body, ...footer].join('\r\n');
};

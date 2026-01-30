import type { CalendarEvent } from '@blms/types';

const formatIcsDate = (date: Date) => {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
};

const formatIcsDateOnly = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, '').split('T')[0];
};

const getNextDayDateOnly = (date: Date) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return formatIcsDateOnly(nextDay);
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
    const isAllDay = event.type === 'history' || event.allDay;
    const startDate = event.startDate;

    const eventLines = [
      'BEGIN:VEVENT',
      `UID:${event.subId ? `event-${event.id}-${event.subId}@plan-b-academy` : `event-${event.id}@plan-b-academy`}`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
    ];

    if (isAllDay) {
      eventLines.push(`DTSTART;VALUE=DATE:${formatIcsDateOnly(startDate)}`);
      const endDate = event.endDate ? event.endDate : startDate;
      eventLines.push(`DTEND;VALUE=DATE:${getNextDayDateOnly(endDate)}`);
    } else {
      const endDate = event.endDate || new Date(startDate.getTime() + 3600000); // Default 1 hour if no end date
      eventLines.push(`DTSTART:${formatIcsDate(startDate)}`);
      eventLines.push(`DTEND:${formatIcsDate(endDate)}`);
    }

    if (event.type === 'history') {
      eventLines.push('RRULE:FREQ=YEARLY');
    }

    eventLines.push(
      `SUMMARY:${escapeSpecialChars(event.name || 'No title')}`,
      `DESCRIPTION:${escapeSpecialChars(event.organizer || '')}`,
      `LOCATION:${escapeSpecialChars(event.addressLine1 || '')}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );

    return eventLines;
  });

  const footer = ['END:VCALENDAR'];

  return [...header, ...body, ...footer].join('\r\n');
};

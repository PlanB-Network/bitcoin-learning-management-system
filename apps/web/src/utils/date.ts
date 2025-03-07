export const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatSecondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}'${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const getOrdinalSuffix = (day: number) => {
  const j = day % 10;
  const k = day % 100;

  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
};

export function formatDate(
  date: Date | null,
  timezone?: string,
  addMonth = true,
  addYear = true,
) {
  if (typeof date?.getDate !== 'function') {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  });

  const day = timezone
    ? new Date(date.toLocaleString('en-US', { timeZone: timezone })).getDate()
    : date.getDate();
  if (Number.isNaN(day)) {
    return '';
  }

  const [month, year] = formatter.format(date).split(' ');

  return addMonth
    ? addYear
      ? `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
      : `${day}${getOrdinalSuffix(day)} ${month}`
    : `${day}${getOrdinalSuffix(day)}`;
}

export function formatTime(date: Date, timezone?: string): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: timezone,
  });

  const formattedTime = timeFormatter.format(date);

  // If the minutes are zero, remove the ":00" (only if it appears before a space and AM/PM)
  return formattedTime.replace(/:00(?=\s[AP]M)/, '');
}

export function addMinutesToDate(originalDate: Date, minutes: number) {
  const newDate = new Date(originalDate);
  newDate.setTime(newDate.getTime() + minutes * 60 * 1000);
  return newDate;
}

export const getDateString = (
  startDate: Date,
  endDate: Date,
  timezone?: string,
) => {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    return '';
  }

  const sameDay = isSameDay(startDate, endDate, timezone);
  const sameMonth = isSameMonth(startDate, endDate, timezone);
  const sameYear = isSameYear(startDate, endDate, timezone);

  if (sameDay) return formatDate(startDate, timezone, true, true);

  return `${formatDate(startDate, timezone, !sameMonth, !sameYear)} to ${formatDate(
    endDate,
    timezone,
    true,
    true,
  )}`;
};

export const getTimeString = (
  startDate: Date,
  endDate: Date,
  timezone?: string,
) => {
  const timezoneText = timezone
    ? ` (${startDate.toLocaleTimeString('en-us', { timeZone: timezone, timeZoneName: 'short' }).split(' ')[2]})`
    : '';

  let timeString: string;

  timeString = formatTime(startDate, timezone);
  if (endDate.getUTCHours() !== 0) {
    timeString += ` to ${formatTime(endDate, timezone)}${timezoneText}`;
  }

  return timeString;
};

export const getTimeStringWithOnlyMonths = (
  startDate: Date | null,
  endDate: Date | null,
) => {
  if (!startDate || !endDate) {
    return '';
  }

  return `${getMonthName(startDate)} to ${getMonthName(endDate)} ${getYear(startDate)}`;
};

export function formatFullDateWithDay(date: Date, timezone?: string): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export const oneDayInMs = 24 * 60 * 60 * 1000;

export function formatDateWithoutTime(date: Date, timezone?: string): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: timezone,
  };

  return new Intl.DateTimeFormat(undefined, options).format(date);
}

export const getMonthName = (
  date: Date,
  locale = 'en-US',
  timezone?: string,
): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    timeZone: timezone,
  }).format(date);
};

export const getYear = (date: Date, locale = 'en-US'): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
  }).format(date);
};

export const isSameDay = (
  startDate: Date,
  endDate: Date,
  timezone?: string,
) => {
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  return formatDate(startDate) === formatDate(endDate);
};

export const isSameMonth = (
  startDate: Date,
  endDate: Date,
  timezone?: string,
) => {
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: '2-digit',
    }).format(date);
  }

  return formatDate(startDate) === formatDate(endDate);
};

export const isSameYear = (
  startDate: Date,
  endDate: Date,
  timezone?: string,
) => {
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
    }).format(date);
  }

  return formatDate(startDate) === formatDate(endDate);
};

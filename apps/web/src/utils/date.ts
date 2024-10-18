export const formatSecondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}'${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const getOrdinalSuffix = (day: number) => {
  const j = day % 10,
    k = day % 100;
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
  date: Date,
  timezone?: string,
  addMonth: boolean = true,
  addYear: boolean = true,
) {
  if (typeof date?.getDate !== 'function') {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  });

  // Get the day of the month. It needs to consider the timezone if provided.
  const day = timezone
    ? new Date(date.toLocaleString('en-US', { timeZone: timezone })).getDate()
    : date.getDate();
  if (Number.isNaN(day)) {
    // Additional check if getDate does not return a valid number
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
  // Check if 'date' is an instance of Date and represents a valid date
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: timezone,
  });

  return timeFormatter.format(date);
}
export function addMinutesToDate(originalDate: Date, minutes: number) {
  const newDate = new Date(originalDate);
  newDate.setTime(newDate.getTime() + minutes * 60 * 1000);
  return newDate;
}

export const getDateString = (
  startDate: Date,
  endDate: Date,
  timezone: string | undefined,
) => {
  let dateString: string;

  switch (true) {
    case startDate.getDate() === endDate.getDate(): {
      dateString = formatDate(startDate, timezone, true, true);
      break;
    }
    case startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDay() !== endDate.getDay(): {
      dateString = formatDate(startDate, timezone, false, false);
      break;
    }
    case startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() !== endDate.getMonth(): {
      dateString = formatDate(startDate, timezone, true, false);
      break;
    }
    default: {
      dateString = formatDate(startDate, timezone, true, true);
    }
  }

  if (startDate.getDate() !== endDate.getDate()) {
    dateString += ` to ${formatDate(endDate, timezone)}`;
  }

  return dateString;
};

export const getTimeString = (
  startDate: Date,
  endDate: Date,
  timezone: string | undefined,
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

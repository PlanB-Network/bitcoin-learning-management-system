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
  date: Date,
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

export function formatDateSimple(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  return `${month} ${day}${getOrdinalSuffix(day)} ${year}`;
}

export function formatMonthYear(date: Date): string {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  return `${month} ${year}`;
}

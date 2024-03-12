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

export function formatDate(date: Date) {
  console.log('date:', date);

  if (typeof date?.getDate !== 'function') {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const day = date.getDate();
  if (Number.isNaN(day)) {
    // Additional check if getDate does not return a valid number
    return '';
  }
  const [month, year] = formatter.format(date).split(' ');

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
}

export function formatTime(date: Date): string {
  // Check if 'date' is an instance of Date and represents a valid date
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  return timeFormatter.format(date);
}
export function addMinutesToDate(originalDate: Date, minutes: number) {
  const newDate = new Date(originalDate);
  newDate.setTime(newDate.getTime() + minutes * 60 * 1000);
  return newDate;
}
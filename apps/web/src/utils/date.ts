export function formatDate(date: Date) {
  // First, we'll define a small function to determine the correct ordinal suffix
  const getOrdinalSuffix = (day) => {
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

  // Then we'll create the formatter for the month and year, since they don't need ordinals
  const formatter = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  // Now we extract the parts of the date we need
  const day = date.getDate();
  const [month, year] = formatter.format(date).split(' ');

  // And return the full string with all parts including the ordinal suffix
  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
}

export function formatTime(date: Date) {
  // Formatter for the time with hour and minutes
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true, // Use 12-hour format
  });

  // Format and return the time part
  return timeFormatter.format(date);
}

export function addMinutesToDate(originalDate: Date, minutes: number) {
  // Create a new Date object from the original to avoid mutating it
  const newDate = new Date(originalDate);
  // Add 90 minutes by adding 90 * 60 * 1000 milliseconds (since 1 minute = 60000 milliseconds)
  newDate.setTime(newDate.getTime() + minutes * 60 * 1000);
  return newDate;
}

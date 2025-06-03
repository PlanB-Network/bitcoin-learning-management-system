export function formatDate(
  value: Date | string | number | undefined,
  timezone?: string,
) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: timezone,
  }).format(new Date(value));
}

export function formatTime(
  value: Date | string | number | undefined,
  timezone?: string,
) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value));
}

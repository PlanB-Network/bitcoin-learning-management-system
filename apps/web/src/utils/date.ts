import { t } from 'i18next';

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
  const effectiveTimezone = getEffectiveTimezone(timezone);

  if (typeof date?.getDate !== 'function') {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: effectiveTimezone,
  });

  const day = effectiveTimezone
    ? new Date(
        date.toLocaleString('en-US', { timeZone: effectiveTimezone }),
      ).getDate()
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
    timeZone: getEffectiveTimezone(timezone),
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
  const effectiveTimezone = getEffectiveTimezone(timezone);
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    return '';
  }

  const sameDay = isSameDay(startDate, endDate, effectiveTimezone);
  const sameMonth = isSameMonth(startDate, endDate, effectiveTimezone);
  const sameYear = isSameYear(startDate, endDate, effectiveTimezone);

  if (sameDay) return formatDate(startDate, effectiveTimezone, true, true);

  return `${formatDate(startDate, effectiveTimezone, !sameMonth, !sameYear)} to ${formatDate(
    endDate,
    effectiveTimezone,
    true,
    true,
  )}`;
};

export const getTimeString = (
  startDate: Date,
  endDate?: Date,
  timezone?: string,
) => {
  const effectiveTimezone = getEffectiveTimezone(timezone);

  const timezoneText = effectiveTimezone
    ? ` (${startDate.toLocaleTimeString('en-us', { timeZone: effectiveTimezone, timeZoneName: 'short' }).split(' ')[2]})`
    : '';

  let timeString: string;

  timeString = formatTime(startDate, effectiveTimezone);

  if (!endDate) {
    return timeString + timezoneText;
  }

  if (endDate.getUTCHours() !== 0) {
    timeString += ` ${t('words.to')} ${formatTime(endDate, effectiveTimezone)}${timezoneText}`;
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

  return `${getMonthName(startDate)} ${t('words.to')} ${getMonthName(endDate)} ${getYear(startDate)}`;
};

export const getTimeStringWithDayAndMonth = (
  startDate: Date | null,
  endDate: Date | null,
  timezone?: string,
) => {
  if (!startDate || !endDate) {
    return '';
  }

  const effectiveTimezone = getEffectiveTimezone(timezone);

  return `${formatDate(startDate, effectiveTimezone, true, false)} to ${formatDate(endDate, effectiveTimezone, true, false)}, ${getYear(endDate)}`;
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
    timeZone: getEffectiveTimezone(timezone),
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
    timeZone: getEffectiveTimezone(timezone),
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
    timeZone: getEffectiveTimezone(timezone),
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
): boolean => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: getEffectiveTimezone(timezone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  const formatter = new Intl.DateTimeFormat('en-US', formatOptions);

  // 4. Format both dates and compare
  return formatter.format(startDate) === formatter.format(endDate);
};

export const isSameMonth = (
  startDate: Date,
  endDate: Date,
  timezone?: string,
) => {
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: getEffectiveTimezone(timezone),
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
      timeZone: getEffectiveTimezone(timezone),
      year: 'numeric',
    }).format(date);
  }

  return formatDate(startDate) === formatDate(endDate);
};

const getEffectiveTimezone = (timezone: string | undefined) => {
  let effectiveTimezone: string;

  if (timezone) {
    try {
      new Intl.DateTimeFormat(undefined, { timeZone: timezone }).format(
        new Date(0),
      );
      effectiveTimezone = timezone;
    } catch (error) {
      console.warn(
        `Invalid timezone "${timezone}" provided. Falling back to system default: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      );
      effectiveTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  } else {
    effectiveTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  return effectiveTimezone;
};

export const getUTCOffset = (timeZone: string): string => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  });

  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find((part) => part.type === 'timeZoneName');

  return offsetPart ? offsetPart.value.replace('GMT', 'UTC') : 'UTC';
};

export const timeZones = {
  'Pacific/Midway': 'Midway Island, Samoa',
  'Pacific/Honolulu': 'Hawaii',
  'America/Juneau': 'Alaska',
  'America/Boise': 'Mountain Time',
  'America/Dawson': 'Dawson, Yukon',
  'America/Chihuahua': 'Chihuahua, La Paz, Mazatlan',
  'America/Phoenix': 'Arizona',
  'America/Chicago': 'Central Time',
  'America/Regina': 'Saskatchewan',
  'America/Mexico_City': 'Guadalajara, Mexico City, Monterrey',
  'America/Belize': 'Central America',
  'America/Detroit': 'Eastern Time',
  'America/Bogota': 'Bogota, Lima, Quito',
  'America/Caracas': 'Caracas, La Paz',
  'America/Santiago': 'Santiago',
  'America/St_Johns': 'Newfoundland and Labrador',
  'America/Sao_Paulo': 'Brasilia',
  'America/Tijuana': 'Tijuana',
  'America/Montevideo': 'Montevideo',
  'America/Argentina/Buenos_Aires': 'Buenos Aires, Georgetown',
  'America/Godthab': 'Greenland',
  'America/Los_Angeles': 'Pacific Time',
  'Atlantic/Azores': 'Azores',
  'Atlantic/Cape_Verde': 'Cape Verde Islands',
  GMT: 'GMT',
  'Europe/London': 'Edinburgh, London',
  'Europe/Dublin': 'Dublin',
  'Europe/Lisbon': 'Lisbon',
  'Africa/Casablanca': 'Casablanca, Monrovia',
  'Atlantic/Canary': 'Canary Islands',
  'Europe/Belgrade': 'Belgrade, Bratislava, Budapest, Ljubljana, Prague',
  'Europe/Sarajevo': 'Sarajevo, Skopje, Warsaw, Zagreb',
  'Europe/Brussels': 'Brussels, Copenhagen, Madrid, Paris',
  'Europe/Amsterdam': 'Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
  'Africa/Algiers': 'West Central Africa',
  'Europe/Bucharest': 'Bucharest',
  'Africa/Cairo': 'Cairo',
  'Europe/Helsinki': 'Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
  'Europe/Athens': 'Athens',
  'Asia/Jerusalem': 'Jerusalem',
  'Africa/Harare': 'Harare, Pretoria',
  'Europe/Moscow': 'Istanbul, Minsk, Moscow, St. Petersburg, Volgograd',
  'Asia/Kuwait': 'Kuwait, Riyadh',
  'Africa/Nairobi': 'Nairobi',
  'Asia/Baghdad': 'Baghdad',
  'Asia/Tehran': 'Tehran',
  'Asia/Dubai': 'Abu Dhabi, Muscat',
  'Asia/Baku': 'Baku, Tbilisi, Yerevan',
  'Asia/Kabul': 'Kabul',
  'Asia/Yekaterinburg': 'Ekaterinburg',
  'Asia/Karachi': 'Islamabad, Karachi, Tashkent',
  'Asia/Kolkata': 'Chennai, Kolkata, Mumbai, New Delhi',
  'Asia/Kathmandu': 'Kathmandu',
  'Asia/Dhaka': 'Astana, Dhaka',
  'Asia/Colombo': 'Sri Jayawardenepura',
  'Asia/Almaty': 'Almaty, Novosibirsk',
  'Asia/Rangoon': 'Yangon Rangoon',
  'Asia/Bangkok': 'Bangkok, Hanoi, Jakarta',
  'Asia/Krasnoyarsk': 'Krasnoyarsk',
  'Asia/Shanghai': 'Beijing, Chongqing, Hong Kong SAR, Urumqi',
  'Asia/Kuala_Lumpur': 'Kuala Lumpur, Singapore',
  'Asia/Taipei': 'Taipei',
  'Australia/Perth': 'Perth',
  'Asia/Irkutsk': 'Irkutsk, Ulaanbaatar',
  'Asia/Seoul': 'Seoul',
  'Asia/Tokyo': 'Osaka, Sapporo, Tokyo',
  'Asia/Yakutsk': 'Yakutsk',
  'Australia/Darwin': 'Darwin',
  'Australia/Adelaide': 'Adelaide',
  'Australia/Sydney': 'Canberra, Melbourne, Sydney',
  'Australia/Brisbane': 'Brisbane',
  'Australia/Hobart': 'Hobart',
  'Asia/Vladivostok': 'Vladivostok',
  'Pacific/Guam': 'Guam, Port Moresby',
  'Asia/Magadan': 'Magadan, Solomon Islands, New Caledonia',
  'Asia/Kamchatka': 'Kamchatka, Marshall Islands',
  'Pacific/Fiji': 'Fiji Islands',
  'Pacific/Auckland': 'Auckland, Wellington',
  'Pacific/Tongatapu': "Nuku'alofa",
};

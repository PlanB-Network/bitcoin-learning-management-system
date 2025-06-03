export const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function formatDate(
  value: Date | string | number | undefined,
  timezone?: string,
  locale = navigator.language,
) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: getEffectiveTimezone(timezone),
  }).format(new Date(value));
}

export function formatDateRange(
  from: Date | string | number | undefined,
  to: Date | string | number | undefined,
  timezone?: string,
  locale = navigator.language,
) {
  if (!from || !to) {
    return '';
  }

  const start = new Date(from);
  const end = new Date(to);

  const baseFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: getEffectiveTimezone(timezone),
  });

  if (typeof baseFormatter.formatRange === 'function') {
    return baseFormatter.formatRange(start, end);
  }

  // ─── Fallback for environments without formatRange ───
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameYear && sameMonth) {
    const dayFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric' });
    const monthYearFormatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    });
    const startDay = dayFormatter.format(start);
    const endDay = dayFormatter.format(end);
    const monthYear = monthYearFormatter.format(start);
    return `${startDay} – ${endDay} ${monthYear}`;
  }

  if (sameYear && !sameMonth) {
    const startFormatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    });
    const endFormatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${startFormatter.format(start)} – ${endFormatter.format(end)}`;
  }
  return '';
}

export function formatTime(
  value: Date | string | number | undefined,
  timezone?: string,
  locale = navigator.language,
) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
    timeZone: getEffectiveTimezone(timezone),
  }).format(new Date(value));
}

export function formatTimeRange(
  from: Date | string | number | undefined,
  to: Date | string | number | undefined,
  timezone?: string,
  locale = navigator.language,
) {
  if (!from || !to) {
    return '';
  }
  const start = new Date(from);
  const end = new Date(to);

  const baseFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: getEffectiveTimezone(timezone),
  });

  if (typeof baseFormatter.formatRange === 'function') {
    return baseFormatter.formatRange(start, end);
  }

  // ─── Fallback for environments without formatRange ───
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameYear && sameMonth) {
    const dayFormatter = new Intl.DateTimeFormat(locale, { day: 'numeric' });
    const monthYearFormatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    });
    const startDay = dayFormatter.format(start);
    const endDay = dayFormatter.format(end);
    const monthYear = monthYearFormatter.format(start);
    return `${startDay} – ${endDay} ${monthYear}`;
  }

  if (sameYear && !sameMonth) {
    const startFormatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    });
    const endFormatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${startFormatter.format(start)} – ${endFormatter.format(end)}`;
  }
}

export function formatHourRange(
  from: Date | string | number | undefined,
  to: Date | string | number | undefined,
  timezone?: string,
  displayTimezone = false,
  locale: string = navigator.language,
): string {
  if (!from || !to) {
    return '';
  }

  const start = new Date(from);
  const end = new Date(to);

  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: getEffectiveTimezone(timezone),
    formatMatcher: 'basic',
    timeZoneName: displayTimezone ? 'short' : undefined,
  });

  if (typeof (formatter as any).formatRange === 'function') {
    return (formatter as any).formatRange(start, end);
  }

  // ─── Fallback (environments without formatRange) ───
  const numberFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    useGrouping: false,
  });
  const startHourStr = numberFormatter.format(start.getHours());
  const endHourStr = numberFormatter.format(end.getHours());

  return `${startHourStr} – ${endHourStr}`;
}

export function formatMonthAndYear(
  value: Date | string | number | undefined,
  timezone?: string,
  locale = navigator.language,
) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    timeZone: getEffectiveTimezone(timezone),
  }).format(new Date(value));
}

export const formatSecondsToMinutes = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}'${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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

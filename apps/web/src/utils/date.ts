import i18next from 'i18next';

export const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function formatDate(
  value: Date | string | number | undefined,
  timezone?: string,
  locale = getEffectiveLocale(),
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
  locale = getEffectiveLocale(),
) {
  if (!from || !to) {
    return '';
  }

  const start = new Date(from);
  const end = new Date(to);

  const baseFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: getEffectiveTimezone(timezone),
    year: 'numeric',
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
  locale = getEffectiveLocale(),
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
  locale = getEffectiveLocale(),
) {
  if (!from || !to) {
    return '';
  }
  const start = new Date(from);
  const end = new Date(to);

  const baseFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    timeZone: getEffectiveTimezone(timezone),
    year: 'numeric',
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
  locale: string = getEffectiveLocale(),
): string {
  if (!from || !to) {
    return '';
  }

  const start = new Date(from);
  const end = new Date(to);

  const formatter = new Intl.DateTimeFormat(locale, {
    formatMatcher: 'basic',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: getEffectiveTimezone(timezone),
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
  locale = getEffectiveLocale(),
) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    timeZone: getEffectiveTimezone(timezone),
    year: 'numeric',
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
  'Africa/Algiers': 'West Central Africa',
  'Africa/Cairo': 'Cairo',
  'Africa/Casablanca': 'Casablanca, Monrovia',
  'Africa/Harare': 'Harare, Pretoria',
  'Africa/Nairobi': 'Nairobi',
  'America/Argentina/Buenos_Aires': 'Buenos Aires, Georgetown',
  'America/Belize': 'Central America',
  'America/Bogota': 'Bogota, Lima, Quito',
  'America/Boise': 'Mountain Time',
  'America/Caracas': 'Caracas, La Paz',
  'America/Chicago': 'Central Time',
  'America/Chihuahua': 'Chihuahua, La Paz, Mazatlan',
  'America/Dawson': 'Dawson, Yukon',
  'America/Detroit': 'Eastern Time',
  'America/Godthab': 'Greenland',
  'America/Juneau': 'Alaska',
  'America/Los_Angeles': 'Pacific Time',
  'America/Mexico_City': 'Guadalajara, Mexico City, Monterrey',
  'America/Montevideo': 'Montevideo',
  'America/Phoenix': 'Arizona',
  'America/Regina': 'Saskatchewan',
  'America/Santiago': 'Santiago',
  'America/Sao_Paulo': 'Brasilia',
  'America/St_Johns': 'Newfoundland and Labrador',
  'America/Tijuana': 'Tijuana',
  'Asia/Almaty': 'Almaty, Novosibirsk',
  'Asia/Baghdad': 'Baghdad',
  'Asia/Baku': 'Baku, Tbilisi, Yerevan',
  'Asia/Bangkok': 'Bangkok, Hanoi, Jakarta',
  'Asia/Colombo': 'Sri Jayawardenepura',
  'Asia/Dhaka': 'Astana, Dhaka',
  'Asia/Dubai': 'Abu Dhabi, Muscat',
  'Asia/Irkutsk': 'Irkutsk, Ulaanbaatar',
  'Asia/Jerusalem': 'Jerusalem',
  'Asia/Kabul': 'Kabul',
  'Asia/Kamchatka': 'Kamchatka, Marshall Islands',
  'Asia/Karachi': 'Islamabad, Karachi, Tashkent',
  'Asia/Kathmandu': 'Kathmandu',
  'Asia/Kolkata': 'Chennai, Kolkata, Mumbai, New Delhi',
  'Asia/Krasnoyarsk': 'Krasnoyarsk',
  'Asia/Kuala_Lumpur': 'Kuala Lumpur, Singapore',
  'Asia/Kuwait': 'Kuwait, Riyadh',
  'Asia/Magadan': 'Magadan, Solomon Islands, New Caledonia',
  'Asia/Rangoon': 'Yangon Rangoon',
  'Asia/Seoul': 'Seoul',
  'Asia/Shanghai': 'Beijing, Chongqing, Hong Kong SAR, Urumqi',
  'Asia/Taipei': 'Taipei',
  'Asia/Tehran': 'Tehran',
  'Asia/Tokyo': 'Osaka, Sapporo, Tokyo',
  'Asia/Vladivostok': 'Vladivostok',
  'Asia/Yakutsk': 'Yakutsk',
  'Asia/Yekaterinburg': 'Ekaterinburg',
  'Atlantic/Azores': 'Azores',
  'Atlantic/Canary': 'Canary Islands',
  'Atlantic/Cape_Verde': 'Cape Verde Islands',
  'Australia/Adelaide': 'Adelaide',
  'Australia/Brisbane': 'Brisbane',
  'Australia/Darwin': 'Darwin',
  'Australia/Hobart': 'Hobart',
  'Australia/Perth': 'Perth',
  'Australia/Sydney': 'Canberra, Melbourne, Sydney',
  'Europe/Amsterdam': 'Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna',
  'Europe/Athens': 'Athens',
  'Europe/Belgrade': 'Belgrade, Bratislava, Budapest, Ljubljana, Prague',
  'Europe/Brussels': 'Brussels, Copenhagen, Madrid, Paris',
  'Europe/Bucharest': 'Bucharest',
  'Europe/Dublin': 'Dublin',
  'Europe/Helsinki': 'Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius',
  'Europe/Lisbon': 'Lisbon',
  'Europe/London': 'Edinburgh, London',
  'Europe/Moscow': 'Istanbul, Minsk, Moscow, St. Petersburg, Volgograd',
  'Europe/Sarajevo': 'Sarajevo, Skopje, Warsaw, Zagreb',
  GMT: 'GMT',
  'Pacific/Auckland': 'Auckland, Wellington',
  'Pacific/Fiji': 'Fiji Islands',
  'Pacific/Guam': 'Guam, Port Moresby',
  'Pacific/Honolulu': 'Hawaii',
  'Pacific/Midway': 'Midway Island, Samoa',
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
    } catch (_error) {
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

const getEffectiveLocale = () => {
  let effectiveLocale: string;

  if (i18next?.language) {
    effectiveLocale = i18next.language;
  } else if (typeof navigator !== 'undefined' && navigator.language) {
    effectiveLocale = navigator.language;
  } else {
    effectiveLocale = 'en-GB';
  }

  return effectiveLocale;
};

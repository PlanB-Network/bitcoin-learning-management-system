import i18next from 'i18next';

export const cdnUrl = (path: string) => {
  if (import.meta.env.VITE_PEAR_ENVIRONMENT === 'testnet') {
    return `https://planbtest.network/cdn/${path}`;
  }
  if (import.meta.env.VITE_PEAR_ENVIRONMENT === 'mainnet') {
    return `https://planb.network/cdn/${path}`;
  }

  return `/cdn/${path}`;
};

export const assetUrl = (
  contentPath: string,
  assetPath: string | null,
  // invalidate cache by passing a cacheKey (usually the last commit sha)
  cacheKey?: string,
) => {
  return cdnUrl(
    `${contentPath}/assets/${assetPath}${cacheKey ? `?c=${cacheKey}` : ''}`,
  );
};

/**
 * Content asset URL
 */
export const resourceImgUrl = (
  resource: { path: string; lastCommit: string },
  assetPath = 'thumbnail.webp',
) => {
  return assetUrl(resource.path, assetPath, resource.lastCommit);
};

export const normalizeString = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\p{M}]/gu, '')
    .toLowerCase();
};

export function getNameAndIdFromUrl(param: string) {
  const objectId = param.slice(-36);
  const objectName = param.slice(0, -37);

  return {
    id: objectId,
    name: objectName,
  };
}

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

export const blogTabs = [
  {
    href: '/blog/',
    id: 'all',
    label: 'publicCommunication.blogCategories.all',
  },
  {
    href: '/blog/content',
    id: 'content',
    label: 'publicCommunication.blogCategories.content',
  },
  {
    href: '/blog/feature',
    id: 'feature',
    label: 'publicCommunication.blogCategories.feature',
  },
  {
    href: '/blog/network',
    id: 'network',
    label: 'publicCommunication.blogCategories.network',
  },
];

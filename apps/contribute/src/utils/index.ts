export * from './course-filters.ts';
export { trpc } from './trpc.ts';

let customCdnUrl = window.localStorage.getItem('cdnUrl');

Object.defineProperty(window, 'setCustomCdnUrl', {
  value: (url: string) => {
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    window.localStorage.setItem('cdnUrl', (customCdnUrl = url));
  },
});

export const cdnUrl = (path: string) => {
  return customCdnUrl ? `${customCdnUrl}/${path}` : `/cdn/${path}`;
};

/**
 * Content asset URL
 */
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

export const compose = (...args: string[]) => args.join(' ');

export const isUUID = (value: unknown) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);

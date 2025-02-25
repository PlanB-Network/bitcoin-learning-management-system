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
export const assetUrl = (contentPath: string, assetPath: string | null) => {
  return cdnUrl(`${contentPath}/assets/${assetPath}`);
};

export const compose = (...args: string[]) => args.join(' ');

export const isUUID = (value: unknown) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);

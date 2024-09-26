export { trpc } from './trpc.ts';

let customCdnUrl = window.localStorage.getItem('cdnUrl');

Object.defineProperty(window, 'setCustomCdnUrl', {
  value: (url: string) => {
    window.localStorage.setItem('cdnUrl', (customCdnUrl = url));
  },
});

export const computeAssetCdnUrl = (commitHash: string, path: string) => {
  return customCdnUrl
    ? `${customCdnUrl}/${commitHash}/${path}`
    : `/cdn/${commitHash}/${path}`;
};

export const compose = (...args: string[]) => args.join(' ');

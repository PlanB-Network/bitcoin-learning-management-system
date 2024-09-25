export { trpc } from './trpc.ts';

let customCdnUrl = '';

Object.defineProperty(window, 'setCustomCdnUrl', {
  value: (url: string) => (customCdnUrl = url),
});

export const computeAssetCdnUrl = (commitHash: string, path: string) => {
  return customCdnUrl
    ? `${customCdnUrl}/${commitHash}/${path}`
    : `/cdn/${commitHash}/${path}`;
};

export const compose = (...args: string[]) => args.join(' ');

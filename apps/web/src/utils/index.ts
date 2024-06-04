export { trpc } from './trpc.ts';

export const computeAssetCdnUrl = (commitHash: string, path: string) => {
  return `/cdn/${commitHash}/${path}`;
};

export const compose = (...args: string[]) => args.join(' ');

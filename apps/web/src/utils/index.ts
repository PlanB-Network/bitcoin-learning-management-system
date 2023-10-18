import { getDomain, isDevelopmentEnvironment } from './misc';

export { trpc } from './trpc';

export const computeAssetCdnUrl = (commitHash: string, path: string) => {
  const baseUrl = isDevelopmentEnvironment()
    ? 'http://localhost:8080'
    : `https://cdn.${getDomain()}`;

  return `${baseUrl}/${commitHash}/${path}`;
};

export const compose = (...args: string[]) => args.join(' ');

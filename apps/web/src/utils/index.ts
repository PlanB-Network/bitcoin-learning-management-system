export { trpc } from './trpc';

export const getDomain = () => {
  return window.location.hostname;
};

export const computeAssetCdnUrl = (commitHash: string, path: string) => {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080'
      : 'https://cdn.sovereignuniversity.org';

  return `${baseUrl}/${commitHash}/${path}`;
};

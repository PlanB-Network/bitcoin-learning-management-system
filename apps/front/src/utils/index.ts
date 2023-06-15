export * from './local-storage';
export * from './routes';
export * from './class';

export const computeAssetCdnUrl = (commitHash: string, path: string) => {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080'
      : 'https://cdn.sovereignuniversity.org';

  return `${baseUrl}/${commitHash}/${path}`;
};

import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';

export type GithubOctokit = Octokit;

export const createGithubOctokit = async ({
  appId,
  privateKey,
  installationId,
}: {
  appId?: number;
  privateKey?: string;
  installationId?: number;
}): Promise<GithubOctokit> => {
  if (!appId || !privateKey || !installationId) {
    throw new Error('Missing configuration for GitHub App');
  }

  const app = new App({
    appId: appId,
    privateKey: privateKey,
    Octokit,
  });

  await app.octokit.rest.apps.getAuthenticated();

  return app.getInstallationOctokit(Number(installationId));
};

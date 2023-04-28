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

  const octokit = await app.getInstallationOctokit(Number(installationId));

  return octokit;
};

export const createDownloadFile =
  (octokit: GithubOctokit) => async (repository: string, path: string) => {
    try {
      const [repoOwner, repoName] = repository.split('/');

      const response = await octokit.rest.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path,
      });

      if (Array.isArray(response.data)) {
        throw new Error(`Path ${path} is a directory`);
      }

      if (response.data.type !== 'file') {
        throw new Error(`Path ${path} is not a file`);
      }

      return Buffer.from(response.data.content, 'base64').toString();
    } catch (error: any) {
      throw new Error(`Failed to download file ${path}: ${error.message}`);
    }
  };

export const createGetDiff =
  (octokit: GithubOctokit) =>
  async (repository: string, before: string, after: string) => {
    try {
      const [repoOwner, repoName] = repository.split('/');

      const response = await octokit.rest.repos.compareCommits({
        owner: repoOwner,
        repo: repoName,
        base: before,
        head: after,
      });

      return response.data.files ?? [];
    } catch (error: any) {
      throw new Error(
        `Failed to getting diff between ${before} and ${after} in ${repository}: ${error.message}`
      );
    }
  };

import { App } from '@octokit/app';
import { Octokit } from '@octokit/core';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';

import type { ChangedFile } from '@sovereign-academy/types';

import { config } from './config';

const OctokitWithRest = Octokit.plugin(restEndpointMethods);

export const keepOnlyMostRecentCommits = (contents: ChangedFile[]) => {
  const contentsMap = new Map<string, ChangedFile>();

  contents.forEach((content) => {
    if (
      !contentsMap.has(content.path) ||
      content.time > (contentsMap.get(content.path) as ChangedFile).time
    )
      contentsMap.set(content.path, content);
  });

  return Array.from(contentsMap.values());
};

export const downloadFileFromGithub = async (path: string) => {
  if (
    !config.github.appId ||
    !config.github.privateKey ||
    !config.github.installationId
  ) {
    throw new Error('Missing configuration for GitHub App');
  }

  if (!config.dataRepository) {
    throw new Error('Missing configuration for data repository');
  }

  const app = new App({
    appId: config.github.appId,
    privateKey: config.github.privateKey,
    Octokit: OctokitWithRest,
  });

  await app.octokit.rest.apps.getAuthenticated();

  const octokit = await app.getInstallationOctokit(
    Number(config.github.installationId)
  );

  try {
    const [repoOwner, repoName] = config.dataRepository.split('/');

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

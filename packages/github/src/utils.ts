/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs/promises';
import path from 'node:path';

import * as async from 'async';
import type { DefaultLogFields, LogResult } from 'simple-git';
import { ResetMode, simpleGit } from 'simple-git';

import type { ChangedFile } from '@sovereign-university/types';

import type { GithubOctokit } from './octokit.js';

const parseRepository = (repository: string) => {
  const [repoOwner, repoName] = repository.split('/');
  return { repoOwner, repoName };
};

const extractRepositoryFromUrl = (url: string) =>
  url.split('/').splice(-1)[0].replace('.git', '');

export const computeTemporaryDirectory = (url: string) =>
  path.join(
    process.env['SYNC_PATH'] || '/tmp/sync',
    extractRepositoryFromUrl(url),
  );

export const createDownloadFile =
  (octokit: GithubOctokit) => async (repository: string, path: string) => {
    try {
      const { repoOwner, repoName } = parseRepository(repository);

      const response = await octokit.rest.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path,
      });

      if (Array.isArray(response.data)) {
        throw new TypeError(`Path ${path} is a directory`);
      }

      if (response.data.type !== 'file') {
        throw new Error(`Path ${path} is not a file`);
      }

      return Buffer.from(response.data.content, 'base64').toString();
    } catch (error: any) {
      throw new Error(
        `Failed to download file ${path}. ${
          error instanceof Error ? error.message : ''
        }`,
      );
    }
  };

const syncRepository = async (
  repository: string,
  branch: string,
  directory: string,
  githubAccessToken?: string,
) => {
  const git = simpleGit();
  try {
    // Clone the repository if it does not exist locally
    if (
      !(await pathExists(directory)) ||
      !(await pathExists(path.join(directory, '.git')))
    ) {
      const options: Record<string, string> = {
        '--depth': '1',
        '--branch': branch,
      };

      // Add authentication header if provided
      if (githubAccessToken) {
        const header = `AUTHORIZATION: basic ${Buffer.from(githubAccessToken).toString('base64')}`;
        options['--config'] = `http.${repository}.extraheader=${header}`;
      }

      console.log(
        `-- Sync procedure: Cloning repository ${directory} on branch ${branch}`,
      );

      try {
        await git.clone(repository, directory, options);

        console.log(
          `-- Sync procedure: Cloned repository ${directory} on branch ${branch}`,
        );
      } catch (error: any) {
        console.warn(
          '[WARN] Failed to clone the repo, will try fetch and pull',
          error instanceof Error ? error.message : '',
        );
      }

      await git.cwd(directory);

      return git;
    }

    // Reset local changes
    await git.cwd(directory).reset(ResetMode.HARD);

    await git.pull('origin', branch);

    return git;
  } catch (error: any) {
    throw new Error(
      `Failed to sync repository ${repository}. ${
        error instanceof Error ? error.message : ''
      }`,
    );
  }
};

/**
 * Walk a directory recursively to get files inside it
 *
 * @param directory - Directory path
 * @param ignore - Ignore some patterns
 * @param only - Get only those files
 * @returns List of files in the directory
 */
export const walk = async (
  directory: string,
  ignore: string[] = [],
): Promise<string[]> => {
  const files = await fs.readdir(directory);

  const parsedFiles = await async.map(files, async (file: string) => {
    const filePath = path.join(directory, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory() && !ignore.includes(file)) {
      return walk(filePath, ignore);
    }

    if (stats.isFile() && !ignore.some((x) => file.includes(x))) {
      return [filePath];
    }

    return [];
  });

  return parsedFiles.flat();
};

const pathExists = async (path: string) =>
  fs
    .stat(path)
    .then(() => true)
    .catch(() => false);

export const getAllRepoFiles = async (
  publicRepositoryUrl: string,
  publicRepositoryBranch = 'main',
  privateRepositoryUrl: string | undefined,
  privateRepositoryBranch = 'main',
  githubAccessToken?: string,
) => {
  console.log(
    '-- Sync procedure: Syncing the public github repository on branch',
    publicRepositoryBranch,
  );

  try {
    let finalFiles: ChangedFile[] = [];
    const publicRepoDir = computeTemporaryDirectory(publicRepositoryUrl);

    const publicGit = await syncRepository(
      publicRepositoryUrl,
      publicRepositoryBranch,
      publicRepoDir,
    );

    // Read all the files
    const publicFiles = await walk(path.resolve(publicRepoDir), ['.git']);

    finalFiles = await async.mapLimit(
      publicFiles.filter((file) => !file.includes('/assets/')),
      10,
      async (file: string) => {
        const relativePath = file.replace(`${publicRepoDir}/`, '');

        const parentDirectoryLog = await publicGit.log({
          file: path.dirname(file),
        });

        return {
          path: relativePath,
          commit: parentDirectoryLog.latest?.hash ?? 'unknown', // Cannot happen (I think)
          time: new Date(
            parentDirectoryLog.latest?.date ?? Date.now(), // Cannot happen (I think)
          ).getTime(),
          kind: 'added' as const,
          data: await fs.readFile(file, 'utf8'),
        };
      },
    );

    if (privateRepositoryUrl && githubAccessToken) {
      console.log(
        '-- Sync procedure: Syncing the private github repository on branch',
        privateRepositoryBranch,
      );

      const privateRepoDir = computeTemporaryDirectory(privateRepositoryUrl);

      const privateGit = await syncRepository(
        privateRepositoryUrl,
        privateRepositoryBranch,
        privateRepoDir,
        githubAccessToken,
      );

      // Read all the files
      const privateFiles = await walk(path.resolve(privateRepoDir), ['.git']);

      const privateFinalFiles: ChangedFile[] = await async.mapLimit(
        privateFiles.filter((file) => !file.includes('/assets/')),
        10,
        async (file: string) => {
          const relativePath = file.replace(`${privateRepoDir}/`, '');

          const parentDirectoryLog = await privateGit.log({
            file: path.dirname(file),
          });

          return {
            path: relativePath,
            commit: parentDirectoryLog.latest?.hash ?? 'unknown', // Cannot happen (I think)
            time: new Date(
              parentDirectoryLog.latest?.date ?? Date.now(), // Cannot happen (I think)
            ).getTime(),
            kind: 'added' as const,
            data: await fs.readFile(file, 'utf8'),
          };
        },
      );

      finalFiles = [...finalFiles, ...privateFinalFiles];
    }

    return finalFiles;
  } catch (error) {
    throw new Error(`Failed to clone and read all repo files: ${error}`);
  }
};

export const syncCdnRepository = async (
  repositoryDirectory: string,
  cdnDirectory: string,
) => {
  const git = simpleGit(repositoryDirectory);

  try {
    const files = await walk(path.resolve(repositoryDirectory), ['.git']);
    const assets = files.filter(
      (file) => file.includes('/assets/') || file.includes('/soon/'),
    );

    // Cache the log of the parent directory of each asset
    const directoryLogCache = new Map<string, LogResult<DefaultLogFields>>();

    for (const asset of assets.reverse()) {
      console.log('sync cdn asset:', asset);

      // Get the log of the parent directory
      const parentDirectory = asset.replace(/\/assets\/.*/, '');
      const cachedParentDirectoryLog = directoryLogCache.get(parentDirectory);
      const parentDirectoryLog = cachedParentDirectoryLog
        ? cachedParentDirectoryLog
        : await git.log({ file: parentDirectory });

      // Cache the log of the parent directory if not already cached
      if (!cachedParentDirectoryLog) {
        directoryLogCache.set(parentDirectory, parentDirectoryLog);
      }

      if (!parentDirectoryLog.latest) continue;

      const relativePath = asset.replace(`${repositoryDirectory}/`, '');

      const cdnPath = path.join(
        cdnDirectory,
        asset.includes('/soon/') ? 'main' : parentDirectoryLog.latest.hash,
        relativePath,
      );
      if (!(await pathExists(cdnPath))) {
        await fs.mkdir(path.dirname(cdnPath), { recursive: true });
        await fs.copyFile(asset, cdnPath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to sync CDN repository: ${error}`);
  }
};

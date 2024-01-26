/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs/promises';
import path from 'node:path';

import * as async from 'async';
import { DiffResultTextFile, ResetMode, simpleGit } from 'simple-git';

import { ChangeKind, ChangedFile } from '@sovereign-university/types';

import { GithubOctokit } from './octokit';

const parseRepository = (repository: string) => {
  const [repoOwner, repoName] = repository.split('/');
  return { repoOwner, repoName };
};

const extractRepositoryFromUrl = (url: string) =>
  url.split('/').splice(-1)[0].replace('.git', '');

const computeTemporaryDirectory = (url: string) =>
  path.join('/tmp', extractRepositoryFromUrl(url));

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

const syncRepository = async (
  repository: string,
  branch: string,
  directory: string,
) => {
  const git = simpleGit();

  try {
    // Check if the repository already exists locally
    if (
      !(await pathExists(directory)) ||
      !(await pathExists(path.join(directory, '.git')))
    ) {
      // Clone the repository
      try {
        await git.clone(repository, directory);
      } catch (error: any) {
        console.warn(
          '[WARN] Failed to clone the repo, will try fetch and pull',
          error.message,
        );
      }
    }

    // Reset local changes
    await git.cwd(directory).reset(ResetMode.HARD);

    // Fetch the remote changes
    await git.fetch('origin', '+refs/heads/*:refs/remotes/origin/*');

    // Get the branch name
    await git.checkout(['-B', branch]);

    // Reset the current branch to match the remote branch
    await git.reset(ResetMode.HARD, [`origin/${branch}`]);

    await git.pull('origin', branch);

    return git;
  } catch (error: any) {
    throw new Error(
      `Failed to sync repository ${repository}: ${error.message}`,
    );
  }
};

export const compareCommits = async (
  repositoryUrl: string,
  branch: string,
  beforeCommit: string,
  afterCommit: string,
): Promise<ChangedFile[]> => {
  const repoDir = computeTemporaryDirectory(repositoryUrl);

  try {
    const git = await syncRepository(repositoryUrl, branch, repoDir);

    const diffSummary = await git.diffSummary([beforeCommit, afterCommit]);

    const textFiles = diffSummary.files.filter(
      (file) => !file.binary,
    ) as DiffResultTextFile[];

    const finalFiles = await async.mapLimit(
      textFiles,
      10,
      async (file: (typeof textFiles)[number]) => {
        let relativePath = file.file;
        let previousPath: string | undefined;

        // SimpleGit doesn't support renamed files, so we need to do it manually
        if (file.file.includes(' => ')) {
          // The file was renamed, check if path of type { .* => .* }
          const elementChanged = file.file.match(/\{(.*) => (.*)\}/);
          if (elementChanged) {
            const [full, previousSub, newSub] = elementChanged;
            previousPath = file.file.replace(full, previousSub);
            relativePath = file.file.replace(full, newSub);
          } else {
            [previousPath, relativePath] = file.file.split(' => ');
          }
        }

        const fullPath = path.join(repoDir, relativePath);

        let kind: ChangeKind = 'modified';
        if (previousPath) {
          kind = 'renamed';
        } else if (file.changes === file.insertions && file.deletions === 0) {
          kind = 'added';
        } else if (
          file.changes === file.deletions &&
          file.insertions === 0 &&
          !(await pathExists(fullPath))
        ) {
          kind = 'removed';
        }

        if (kind === 'removed') {
          return {
            path: relativePath,
            kind,
          };
        }

        const fileLog = await git.log({ file: relativePath });

        return {
          path: relativePath,
          commit: fileLog.latest?.hash ?? 'unknown', // Cannot happen (I think)
          time: new Date(
            fileLog.latest?.date ?? Date.now(), // Cannot happen (I think)
          ).getTime(),
          data: await fs.readFile(fullPath, 'utf-8'),
          ...(kind === 'renamed'
            ? // If the file was renamed, we need to add the previous path so we can update it
              {
                kind: 'renamed',
                previousPath,
              }
            : { kind }),
        } as ChangedFile;
      },
    );

    return finalFiles;
  } catch (error: any) {
    throw new Error(
      `Failed to get the diff between ${beforeCommit} and ${afterCommit} in ${repositoryUrl}: ${error.message}`,
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
  repositoryUrl: string,
  branch = 'main',
) => {
  console.log(
    '-- Sync procedure: Syncing the github repository on branch',
    branch,
  );

  const repoDir = computeTemporaryDirectory(repositoryUrl);

  try {
    const git = await syncRepository(repositoryUrl, branch, repoDir);

    // Read all the files
    const files = await walk(path.resolve(repoDir), ['.git']);

    const finalFiles: ChangedFile[] = await async.mapLimit(
      files.filter((file) => !file.includes('/assets/')),
      10,
      async (file: string) => {
        const relativePath = file.replace(`${repoDir}/`, '');

        const parentDirectoryLog = await git.log({ file: path.dirname(file) });

        return {
          path: relativePath,
          commit: parentDirectoryLog.latest?.hash ?? 'unknown', // Cannot happen (I think)
          time: new Date(
            parentDirectoryLog.latest?.date ?? Date.now(), // Cannot happen (I think)
          ).getTime(),
          kind: 'added' as const,
          data: await fs.readFile(file, 'utf-8'),
        };
      },
    );

    return finalFiles;
  } catch (error) {
    throw new Error(`Failed to clone and read all repo files: ${error}`);
  }
};

export const syncCdnRepository = async (
  repositoryDirectory: string,
  cdnDirectory: string,
) => {
  const git = simpleGit();

  try {
    const files = await walk(path.resolve(repositoryDirectory), ['.git']);
    const assets = files.filter(
      (file) => file.includes('/assets/') || file.includes('/soon/'),
    );

    for (const asset of assets) {
      console.log('sync cdn asset:', asset);
      const parentDirectoryLog = await git
        .cwd(repositoryDirectory)
        .log({ file: asset.replace(/\/assets\/.*/, '') });
      const relativePath = asset.replace(`${repositoryDirectory}/`, '');

      if (!parentDirectoryLog.latest) continue;

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

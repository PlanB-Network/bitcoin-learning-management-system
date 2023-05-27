import fs from 'node:fs/promises';
import path from 'node:path';

import * as async from 'async';
import { simpleGit } from 'simple-git';

import { ChangeKind, ChangedFile } from '@sovereign-academy/types';

import { GithubOctokit } from './octokit';

const parseRepository = (repository: string) => {
  const [repoOwner, repoName] = repository.split('/');
  return { repoOwner, repoName };
};

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

export const createGetChangedFiles =
  (octokit: GithubOctokit) =>
  async (repository: string, before: string, after: string) => {
    try {
      const { repoOwner, repoName } = parseRepository(repository);
      const downloadFile = createDownloadFile(octokit);

      const response = await octokit.rest.repos.compareCommits({
        owner: repoOwner,
        repo: repoName,
        base: before,
        head: after,
      });

      const { files } = response.data;
      if (!files) return [];

      return async.mapLimit(files, 10, async (item: typeof files[number]) => {
        // We know for sure that every file has a commit because we are getting the diff
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const commit = response.data.commits.find(
          (commit) => commit.sha === item.contents_url.slice(-40)
        )!;

        const time = new Date(
          commit.commit.committer?.date
            ? commit.commit.committer.date
            : commit.commit.author?.date
            ? commit.commit.author.date
            : // Fallback to the current time if no commit date is found
              Date.now()
        ).getTime();

        const kind = item.status as ChangeKind;
        const isAsset = item.filename.includes('assets');

        const file: ChangedFile = {
          path: item.filename,
          commit: commit.sha,
          time,
          ...(isRenamed(kind)
            ? // If the file was renamed, we need to add the previous path so we can update it
              {
                kind: 'renamed',
                previousPath: item.previous_filename as string,
              }
            : { kind }),
          ...(isAsset
            ? // If the file is an asset, we don't need to download the raw data as we will
              // get it directl from the GitHub CDN
              { isAsset }
            : // If the file isn't an asset, then it is a text file (markdown, yaml, etc.) and
              // we need to download the raw data
              { isAsset, data: await downloadFile(repository, item.filename) }),
        };

        return file;
      });
    } catch (error: any) {
      throw new Error(
        `Failed to getting diff between ${before} and ${after} in ${repository}: ${error.message}`
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
  ignore: string[] = []
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

export const getAllRepoFiles = async (repository: string) => {
  const tmpDir = `/tmp/sovereign-university-data`;

  const git = simpleGit();

  try {
    // Check if the repository already exists locally
    if (
      (await pathExists(tmpDir)) &&
      (await pathExists(path.join(tmpDir, '.git')))
    ) {
      // Pull updates
      await git.cwd(tmpDir).pull();
    } else {
      // Clone the repository
      await git.clone(repository, tmpDir);
    }

    // Read all the files
    const files = await walk(path.resolve(tmpDir), ['.git']);

    const finalFiles = await async.mapLimit(files, 10, async (file: string) => {
      const relativePath = file.replace(`${tmpDir}/`, '');

      const fileLog = await git.log({ file });
      const isAsset = relativePath.includes('assets');

      return {
        path: relativePath,
        commit: fileLog.latest?.hash ?? 'unknown', // Cannot happen (I think)
        time: new Date(
          fileLog.latest?.date ?? Date.now() // Cannot happen (I think)
        ).getTime(),
        kind: 'added',
        ...(isAsset
          ? // If the file is an asset, we don't need to read the raw data as we will
            // get it directl from the GitHub CDN
            { isAsset }
          : // If the file isn't an asset, then it is a text file (markdown, yaml, etc.) and
            // we need to read the raw data
            { isAsset, data: await fs.readFile(file, 'utf-8') }),
      } as ChangedFile;
    });

    return finalFiles;
  } catch (error) {
    throw new Error(`Failed to clone and read all repo files: ${error}`);
  }
};

const isRenamed = (
  changeKind: ChangeKind
): changeKind is Extract<ChangeKind, 'renamed'> => {
  return changeKind === 'renamed';
};

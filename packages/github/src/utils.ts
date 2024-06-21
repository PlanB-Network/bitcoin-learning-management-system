/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync, mkdirSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import * as async from 'async';
import type { LogResult, SimpleGit } from 'simple-git';
import { simpleGit } from 'simple-git';

import type {
  ChangedFile,
  GitHubSyncConfig,
} from '@sovereign-university/types';

import type { GithubOctokit } from './octokit.js';

export const timeLog = (str: string) => {
  const key = `-- Sync procedure: ${str}`;
  console.log(key + '...');
  console.time(key);

  return () => {
    console.timeEnd(key);
  };
};

const parseRepository = (repository: string) => {
  const [repoOwner, repoName] = repository.split('/');
  return { repoOwner, repoName };
};

const extractRepositoryFromUrl = (url: string) => {
  return url.split('/').splice(-1)[0].replace('.git', '');
};

const computeSyncDirectory = (syncPath: string, url: string) => {
  return path.join(syncPath, extractRepositoryFromUrl(url));
};

/**
 * Wrapper around a function to cache its results
 */
const createCache = <T>(map = new Map<string, T>()) => {
  return (fn: (key: string) => T) => {
    return (key: string) => {
      const cached = map.get(key);
      if (cached) {
        return cached;
      }

      const value = fn(key);
      map.set(key, value);
      return value;
    };
  };
};

const cacheSymbol = Symbol('logCache');
type GitLogReturn = Promise<LogResult<{ hash: string; date: string } | null>>;
type SimpleGitExt = SimpleGit & { [cacheSymbol]?: Map<string, GitLogReturn> };
const createGetGitLog = (git: SimpleGitExt) => {
  const fn = (file: string) =>
    git.log({
      file,
      maxCount: 1,
      format: { hash: '%H', date: '%aI' },
    });

  if (!git[cacheSymbol]) {
    git[cacheSymbol] = new Map();
  } else {
    console.log(
      `-- Sync procedure: Reusing cache of ${git[cacheSymbol].size} entries`,
    );
  }

  return createCache(git[cacheSymbol])(fn);
};

export const createDownloadFile = (octokit: GithubOctokit) => {
  return async (repository: string, path: string) => {
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
};

/**
 * @param repository - Directory path to the repository (sync)
 * @param branch     - Branch to sync
 * @param directory  - Directory to sync the repository to (cdn)
 * @param githubAccessToken - Token to access the repository (if private)
 * @returns a simple-git instance
 */
const syncRepository = async (
  repository: string,
  branch: string,
  directory: string,
  githubAccessToken?: string,
) => {
  const directoryBranch = await simpleGit()
    .cwd(directory)
    .branchLocal()
    .then((branches) => branches.current)
    .catch(() => null);

  // Clone the repository if it does not exist locally or if the branch is different
  if (directoryBranch !== branch) {
    const options: Record<string, string> = {
      '--branch': branch,
      '--depth': '1',
    };

    // Add authentication header if provided
    if (githubAccessToken) {
      const header = `AUTHORIZATION: basic ${Buffer.from(githubAccessToken).toString('base64')}`;
      options['--config'] = `http.${repository}.extraheader=${header}`;
    }

    const timeClone = timeLog(`Cloning repository on branch ${branch}`);

    // If the directory already exists, remove it (should not happen in production)
    if (directoryBranch || existsSync(directory)) {
      console.warn(
        `[WARN] Directory already synced on branch ${directoryBranch}, removing it`,
      );
      await fs.rm(directory, { recursive: true });
    }

    try {
      const git = simpleGit();
      await git.clone(repository, directory, options);
      await git.cwd(directory);

      console.log(`-- Sync procedure: Cloned repository on branch ${branch}`);
      timeClone();

      return git;
    } catch (error: any) {
      console.warn(
        '[WARN] Failed to clone the repo, will try fetch and pull',
        error instanceof Error ? error.message : '',
      );

      throw new Error(
        `Failed to sync repository ${repository}. ${
          error instanceof Error ? error.message : ''
        }`,
      );
    }
  }

  const timePull = timeLog(`Pulling changes on branch ${branch}`);

  try {
    const git = simpleGit(directory);

    // Get the current branch (commit is a shortened hash)
    const currentBranch = await git
      .branchLocal()
      .then(({ current, branches }) => branches[current]);

    // Full commit hash of the remote branch
    const remoteHash = await git.revparse([`origin/${branch}`]);

    if (remoteHash.startsWith(currentBranch.commit)) {
      console.log(`-- Sync procedure: Branch ${branch} is up to date`);
    } else {
      await git.fetch();
      await git.reset(['--hard', `origin/${branch}`]);
    }

    timePull();

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
 * List all files in a repository
 *
 * @param git - SimpleGit instance
 * @param pattern - Patterns to exclude, defaults to hidden files
 * @returns a list of files in the repository
 */
async function listFiles(git: SimpleGit, pattern = [':!.*']) {
  const files = await git.raw(['ls-files', '-z', ...pattern]);

  // Filter out empty strings and hidden files
  return files.split('\0').filter((file) => file && !file.startsWith('.'));
}

function maxPathDepth(path: string, depth = 3) {
  return path.split('/').slice(0, depth).join('/');
}

/**
 * List and load (read) all content (non-assets) files in a repository
 */
async function loadRepoContentFiles(
  repoDir: string,
  git: SimpleGit,
): Promise<ChangedFile[]> {
  const timeReadFilesTotal = timeLog(`Reading files in ${repoDir}`);

  const timeListFiles = timeLog(`Listing files in ${repoDir}`);
  const publicFiles = await listFiles(git, [':!.*', ':!:*assets*']);
  timeListFiles();

  const getGitLog = createGetGitLog(git);

  const timeMapDirs = timeLog(
    `Mapping directories for ${publicFiles.length} files`,
  );

  // Get the parent directories of the files
  const parentDirectories = publicFiles
    // Get the parent directory
    .map((file) => maxPathDepth(path.dirname(file)))
    // Remove duplicates
    .filter((dir, index, self) => self.indexOf(dir) === index);

  timeMapDirs();

  // Preload the parent directories logs
  {
    const timeGetParentDirectoryGitLogs = timeLog(
      `Loading logs for ${parentDirectories.length} keys`,
    );

    for (const parentDirectory of parentDirectories) {
      const parentDirectoryLog = await getGitLog(parentDirectory);
      if (!parentDirectoryLog.latest) {
        console.log('getGitLog', parentDirectory, 'not found');
      }

      // console.log(
      //   'getGitLog',
      //   parentDirectory,
      //   parentDirectoryLog.latest?.hash,
      //   parentDirectoryLog.latest?.date,
      // );
    }

    timeGetParentDirectoryGitLogs();
  }

  const timeRead = timeLog(`Reading ${publicFiles.length} files`);

  const files = await async.mapLimit(publicFiles, 10, async (file: string) => {
    const filePath = path.join(repoDir, file);

    const parentDirectory = maxPathDepth(path.dirname(file));
    const parentDirectoryLog = await getGitLog(parentDirectory);

    return {
      path: file,
      commit: parentDirectoryLog.latest?.hash ?? 'unknown', // Cannot happen (I think)
      time: new Date(
        parentDirectoryLog.latest?.date ?? Date.now(), // Cannot happen (I think)
      ).getTime(),
      kind: 'added' as const,
      data: await fs.readFile(filePath, 'utf8'),
    };
  });

  timeRead();
  timeReadFilesTotal();

  return files;
}

/**
 * Factory to sync the repositories (clone or pull) and reads all content (non-assets) files
 *
 * @param options - Configuration options
 * @returns a function that syncs the repository and reads all content files
 */
export const createSyncRepositories = (options: GitHubSyncConfig) => {
  return async () => {
    console.log(
      '-- Sync procedure: Syncing the public github repository on branch',
      options.publicRepositoryBranch,
    );

    try {
      const publicRepoDir = computeSyncDirectory(
        options.syncPath,
        options.publicRepositoryUrl,
      );

      const publicGit = await syncRepository(
        options.publicRepositoryUrl,
        options.publicRepositoryBranch,
        publicRepoDir,
      );

      // Read all the files
      const publicFiles = await loadRepoContentFiles(publicRepoDir, publicGit);

      if (options.privateRepositoryUrl && options.githubAccessToken) {
        console.log(
          '-- Sync procedure: Syncing the private github repository on branch',
          options.privateRepositoryBranch,
        );

        const privateRepoDir = computeSyncDirectory(
          options.syncPath,
          options.privateRepositoryUrl,
        );

        const privateGit = await syncRepository(
          options.privateRepositoryUrl,
          options.privateRepositoryBranch,
          privateRepoDir,
          options.githubAccessToken,
        );

        // Read all the files
        const privateFiles = await loadRepoContentFiles(
          privateRepoDir,
          privateGit,
        );

        return {
          files: [...publicFiles, ...privateFiles],
          publicGit,
          publicRepoDir,
          privateGit,
          privateRepoDir,
        };
      }

      return {
        files: publicFiles,
        publicGit,
        publicRepoDir,
      };
    } catch (error) {
      throw new Error(`Failed to clone and read all repo files: ${error}`);
    }
  };
};

/**
 * Sync repository assets
 *
 * @param options - Configuration options
 * @param options.syncPath - Path to sync the repository
 * @param options.cdnPath - Path to sync the repository to
 */
export const createSyncCdnRepository = (cdnPath: string) => {
  return async (repositoryDirectory: string, git: SimpleGit) => {
    try {
      const timeListFiles = timeLog(`Listing files in ${repositoryDirectory}`);

      const assets = await listFiles(git, [':!.*', ':*assets*', ':*soon*']);
      timeListFiles();

      const getGitLog = createGetGitLog(git);
      const existDir = createCache<boolean>()((dir: string) => existsSync(dir));

      const parentDirectories = assets
        // Get the parent directory
        .map((asset) => asset.replace(/\/assets\/.*/, ''))
        // Remove duplicates
        .filter((dir, index, self) => self.indexOf(dir) === index);

      const timeLoadLogs = timeLog(
        `Loading logs for ${parentDirectories.length} keys`,
      );
      // Preload the parent directories logs
      for (const parentDirectory of parentDirectories) {
        // Get the log of the parent directory
        const parentDirectoryLog = await getGitLog(parentDirectory);
        if (!parentDirectoryLog.latest) {
          continue; // We could not find the parent directory log
        }

        // console.log(
        //   'getGitLog2',
        //   parentDirectory,
        //   parentDirectoryLog.latest.hash,
        // );
      }
      timeLoadLogs();

      const timeAssetSync = timeLog(`Syncing assets to the CDN`);
      for (const asset of assets) {
        // Get the log of the parent directory
        const parentDirectory = asset.replace(/\/assets\/.*/, '');
        const parentDirectoryLog = await getGitLog(parentDirectory);
        if (!parentDirectoryLog.latest) {
          console.warn('getGitLog2', parentDirectory, 'not found');
          continue; // We could not find the parent directory log
        }

        const relativePath = asset.replace(`${repositoryDirectory}/`, '');

        const computedCdnPath = path.join(
          cdnPath,
          asset.includes('/soon/') ? 'main' : parentDirectoryLog.latest.hash,
          relativePath,
        );

        const cdnDir = path.dirname(computedCdnPath);

        if (!existDir(cdnDir)) {
          // console.log(`Creating directory ${cdnDir}`);
          await mkdirSync(cdnDir, { recursive: true });
        }

        if (!existsSync(computedCdnPath)) {
          const absolutePath = path.join(repositoryDirectory, asset);

          // console.log(`Copying ${asset} to ${computedCdnPath}`);

          await fs.copyFile(absolutePath, computedCdnPath);
        }
      }

      timeAssetSync();
    } catch (error) {
      throw new Error(`Failed to sync CDN repository: ${error}`);
    }
  };
};

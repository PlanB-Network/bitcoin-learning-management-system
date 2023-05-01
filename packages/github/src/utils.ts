import * as async from 'async';

import {
  ChangeKind,
  ChangedAsset,
  ChangedFile,
} from '@sovereign-academy/types';

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
        const common = {
          path: item.filename,
          commit: commit.sha,
          time,
        };

        if (item.filename.includes('assets')) {
          const asset: ChangedAsset = {
            ...common,
            url: item.raw_url,
            ...(isRenamed(kind)
              ? {
                  kind: 'renamed',
                  previousPath: item.previous_filename as string,
                }
              : { kind }),
          };

          return asset;
        }

        const file: ChangedFile = {
          ...common,
          data: await downloadFile(repository, item.filename),
          ...(isRenamed(kind)
            ? {
                kind: 'renamed',
                previousPath: item.previous_filename as string,
              }
            : { kind }),
        };

        return file;
      });
    } catch (error: any) {
      throw new Error(
        `Failed to getting diff between ${before} and ${after} in ${repository}: ${error.message}`
      );
    }
  };

import * as async from 'async';

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

export const createGetAllRepoFiles =
  (octokit: GithubOctokit) =>
  async (repository: string, from?: number, to?: number) => {
    const { repoOwner, repoName } = parseRepository(repository);

    const getChangedFiles = createGetChangedFiles(octokit);

    const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner: repoOwner,
      repo: repoName,
      ...(from && { since: new Date(from).toISOString() }),
      ...(to && { until: new Date(to).toISOString() }),
    });

    const oldestCommit = commits[commits.length - 1];
    const newestCommit = commits[0];

    const files = await getChangedFiles(
      repository,
      oldestCommit.sha,
      newestCommit.sha
    );

    return files;
  };

const isRenamed = (
  changeKind: ChangeKind
): changeKind is Extract<ChangeKind, 'renamed'> => {
  return changeKind === 'renamed';
};

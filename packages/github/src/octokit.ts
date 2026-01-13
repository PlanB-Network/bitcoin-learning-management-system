import { Octokit } from 'octokit';

export const createOctokit = (token: string): Octokit => {
  return new Octokit({ auth: token });
};

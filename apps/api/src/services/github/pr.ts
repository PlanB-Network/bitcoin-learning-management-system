import crypto from 'node:crypto';

import { createOctokit } from '@blms/github';
import type { CreateResourcePR } from '@blms/types';
import yaml from 'js-yaml';
import type { Dependencies } from '../../dependencies.js';

type CreateResourcePRInput = CreateResourcePR;

export const createResourcePR = async (
  dependencies: Dependencies,
  input: CreateResourcePRInput,
) => {
  const { config } = dependencies;
  const token = config.sync.githubPrToken;

  if (!token) {
    throw new Error('GITHUB_PR_TOKEN is not configured');
  }

  const octokit = createOctokit(token);
  const repoUrl = config.sync.publicRepositoryUrl;
  const { owner, repo } = getRepoDetails(repoUrl);
  const baseBranch = config.sync.publicRepositoryBranch;

  // 1. Generate unique ID and branch name
  const resourceId = crypto.randomUUID();
  const normalizedTitle = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const branchName = `add-${input.type}-${normalizedTitle.slice(0, 20)}-${resourceId.slice(0, 8)}`;

  // 2. Prepare files content
  const files: {
    path: string;
    content: string;
    encoding?: 'base64' | 'utf-8';
  }[] = [];

  const categoryDir = input.type === 'project' ? 'projects' : input.type;
  const basePath = `resources/${categoryDir}/${normalizedTitle}`;

  if (input.type === 'project') {
    const projectYaml = {
      id: resourceId,
      name: input.title,
      links: input.links,
      category: input.category,
      original_language: input.language,
      languages: input.category === 'communities' ? [input.language] : [],
      address_city_country:
        input.category === 'communities' ? input.country : '',
      tags: input.tags,
    };

    const projectLocalizedYaml = {
      description: input.description,
    };

    files.push({
      path: `${basePath}/project.yml`,
      content: yaml.dump(projectYaml),
    });
    files.push({
      path: `${basePath}/${input.language}.yml`,
      content: yaml.dump(projectLocalizedYaml),
    });

    if (input.coverImage) {
      files.push({
        path: `${basePath}/assets/logo.webp`,
        content: input.coverImage.data.split(',')[1],
        encoding: 'base64',
      });
    }
  }

  // 3. Create Branch and PR
  try {
    // Get the SHA of the latest commit on the base branch
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });
    const baseSha = refData.object.sha;

    // Create a new branch
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    // Create files using a single commit (blobs + tree)
    const treeItems = await Promise.all(
      files.map(async (file) => {
        const { data: blobData } = await octokit.rest.git.createBlob({
          owner,
          repo,
          content: file.content,
          encoding: file.encoding || 'utf-8',
        });
        return {
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blobData.sha,
        };
      }),
    );

    const { data: treeData } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseSha,
      tree: treeItems,
    });

    const { data: commitData } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `Add ${input.type}: ${input.title}`,
      tree: treeData.sha,
      parents: [baseSha],
    });

    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branchName}`,
      sha: commitData.sha,
    });

    // Create the Pull Request
    const { data: prData } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: `Add ${input.type}: ${input.title}`,
      head: branchName,
      base: baseBranch,
      body: `This PR adds a new ${input.type} resource: **${input.title}**.\n\nAutomated submission from the BLMS platform.`,
    });

    return { prUrl: prData.html_url };
  } catch (error) {
    console.error('Error creating GitHub PR:', error);
    throw new Error(`Failed to create GitHub PR: ${(error as any).message}`);
  }
};

function getRepoDetails(url: string) {
  // Handle both https and ssh formats
  const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (!match) throw new Error(`Invalid GitHub URL: ${url}`);
  return { owner: match[1], repo: match[2].replace('.git', '') };
}

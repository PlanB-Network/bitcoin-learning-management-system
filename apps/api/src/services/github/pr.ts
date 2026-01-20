import crypto from 'node:crypto';

import { createOctokit } from '@blms/github';
import { createGetUserDetails } from '@blms/service-user';
import type { CreateResourcePR } from '@blms/types';
import yaml from 'js-yaml';
import type { Dependencies } from '../../dependencies.js';

export const createResourcePR = async (
  dependencies: Dependencies,
  input: CreateResourcePR,
  uid: string,
) => {
  const { config } = dependencies;
  const token = config.sync.githubPrToken;

  if (!token) {
    throw new Error('Resource submission is temporarily unavailable.');
  }

  const octokit = createOctokit(token);
  const repoUrl = config.sync.publicRepositoryUrl;
  const { owner, repo } = getRepoDetails(repoUrl);
  const baseBranch = config.sync.publicRepositoryBranch;
  const allowedTypes = [
    'projects',
    'books',
    'movies',
    'podcasts',
    'channels',
    'newsletters',
  ];

  if (!allowedTypes.includes(input.type)) {
    throw new Error(`Resource type "${input.type}" is not allowed`);
  }

  const resourceId = crypto.randomUUID();
  const normalizedTitle = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const branchName = `add-${input.type}-${normalizedTitle.slice(0, 20)}-${resourceId}`;

  const getUserDetails = createGetUserDetails(dependencies);
  const user = await getUserDetails({ uid });
  const contributorName = user?.displayName || 'Unknown';

  const files: {
    path: string;
    content: string;
    encoding?: 'base64' | 'utf-8';
  }[] = [];

  const categoryDir = input.type;
  const basePath = `resources/${categoryDir}/${normalizedTitle}`;

  const today = new Date().toISOString().split('T')[0];

  const proofreadingDefault = [
    {
      language: input.language,
      last_contribution_date: today,
      urgency: 1,
      contributor_names: [contributorName],
      reward: 0,
    },
  ];

  // PROJECTS
  if (input.type === 'projects') {
    const projectYaml = {
      id: resourceId,
      name: input.title,
      category: input.category,
      links: input.links,
      original_language: input.language,
      proofreading: proofreadingDefault,
    };

    const projectLocalizedYaml = {
      description: input.description,
    };

    files.push({
      path: `${basePath}/project.yml`,
      content: yaml.dump(projectYaml, {
        lineWidth: -1,
      }),
    });
    files.push({
      path: `${basePath}/${input.language}.yml`,
      content: yaml.dump(projectLocalizedYaml, {
        lineWidth: -1,
      }),
    });

    if (input.coverImage) {
      files.push({
        path: `${basePath}/assets/logo.webp`,
        content: input.coverImage.data.split(',')[1],
        encoding: 'base64',
      });
    }
  }

  // BOOKS
  if (input.type === 'books') {
    const bookYaml = {
      id: resourceId,
      author: input.author,
      original_language: input.language,
      proofreading: proofreadingDefault,
    };

    const bookLocalizedYaml = {
      title: input.title,
      publication_year: input.publicationYear
        ? Number(input.publicationYear)
        : undefined,
      cover: `cover_${input.language}.webp`,
      original: true,
      description: input.description,
    };

    files.push({
      path: `${basePath}/book.yml`,
      content: yaml.dump(bookYaml, {
        lineWidth: -1,
      }),
    });
    files.push({
      path: `${basePath}/${input.language}.yml`,
      content: yaml.dump(bookLocalizedYaml, {
        lineWidth: -1,
      }),
    });

    if (input.coverImage) {
      files.push({
        path: `${basePath}/assets/cover_${input.language}.webp`,
        content: input.coverImage.data.split(',')[1],
        encoding: 'base64',
      });
    }
  }

  // PODCASTS
  if (input.type === 'podcasts') {
    const podcastYaml = {
      id: resourceId,
      name: input.title,
      host: input.author,
      language: input.contentLanguage,
      links: {
        podcast: input.resourceLink,
      },
      duration: input.duration,
      publication_year: input.publicationYear
        ? Number(input.publicationYear)
        : undefined,
      description: input.description,
    };

    files.push({
      path: `${basePath}/podcast.yml`,
      content: yaml.dump(podcastYaml, {
        lineWidth: -1,
      }),
    });

    if (input.coverImage) {
      files.push({
        path: `${basePath}/assets/logo.webp`,
        content: input.coverImage.data.split(',')[1],
        encoding: 'base64',
      });
    }
  }

  // CHANNELS
  if (input.type === 'channels') {
    const channelYaml = {
      id: resourceId,
      name: input.title,
      language: input.contentLanguage,
      links: {
        channel: input.resourceLink,
        trailer: input.trailerLink,
      },
      description: input.description,
    };

    files.push({
      path: `${basePath}/channel.yml`,
      content: yaml.dump(channelYaml, {
        lineWidth: -1,
      }),
    });

    if (input.coverImage) {
      files.push({
        path: `${basePath}/assets/thumbnail.webp`,
        content: input.coverImage.data.split(',')[1],
        encoding: 'base64',
      });
    }
  }

  // NEWSLETTERS
  if (input.type === 'newsletters') {
    const newsletterYaml = {
      id: resourceId,
      title: input.title,
      author: input.author,
      links: [
        {
          website: input.resourceLink,
        },
      ],
      language: input.contentLanguage,
      description: input.description,
    };

    files.push({
      path: `${basePath}/newsletter.yml`,
      content: yaml.dump(newsletterYaml, {
        lineWidth: -1,
      }),
    });

    if (input.coverImage) {
      files.push({
        path: `${basePath}/assets/thumbnail.webp`,
        content: input.coverImage.data.split(',')[1],
        encoding: 'base64',
      });
    }
  }

  // MOVIES
  if (input.type === 'movies') {
    const movieYaml = {
      id: resourceId,
      title: input.title,
      author: input.author,
      publication_year: input.publicationYear
        ? Number(input.publicationYear)
        : undefined,
      duration: input.duration,
      language: input.contentLanguage,
      links: {
        platform: input.resourceLink,
        trailer: input.trailerLink,
      },
      description: input.description,
    };

    files.push({
      path: `${basePath}/movie.yml`,
      content: yaml.dump(movieYaml, {
        lineWidth: -1,
      }),
    });

    if (input.coverImage) {
      files.push({
        path: `${basePath}/assets/thumbnail.webp`,
        content: input.coverImage.data.split(',')[1],
        encoding: 'base64',
      });
    }
  }

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
      title: `[${input.type.slice(0, -1).toUpperCase()} submission] ${input.title}`,
      head: branchName,
      base: baseBranch,
      body: `This PR adds a new ${input.type.slice(0, -1)} resource: **${input.title}**.\n\nSubmission from the BLMS platform by ${contributorName}.`,
    });

    return { prUrl: prData.html_url };
  } catch (error) {
    console.error('Error creating GitHub PR:', error);
    throw new Error('Resource submission failed. Try again later.');
  }
};

function getRepoDetails(url: string) {
  // Handle both https and ssh formats
  const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (!match) throw new Error(`Invalid GitHub URL: ${url}`);
  return { owner: match[1], repo: match[2].replace('.git', '') };
}

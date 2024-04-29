import { randomUUID } from 'node:crypto';

import matter from 'gray-matter';
import { marked } from 'marked';

import { firstRow } from '@sovereign-university/database';
import type { Resource } from '@sovereign-university/types';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

interface ConferenceMain {
  year: string;
  builder?: string;
  language: string[];
  links?: {
    website?: string;
    twitter?: string;
  };
}

interface ConferenceLocalized {
  name: string;
  description: string;
}

interface Stage {
  id: string;
  name: string;
  videos: Video[];
}

interface Video {
  id: string;
  name: string;
  link: string;
  description: string;
}

const extractStages = (markdown: string): Stage[] => {
  const tokens = marked.lexer(markdown);
  const stages: Stage[] = [];

  let collectingDescription = false;

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1) {
      stages.push({ id: randomUUID(), name: token.text as string, videos: [] });
    } else if (stages.length > 0) {
      const currentStage = stages.at(-1)!;

      if (token.type === 'heading' && token.depth === 2) {
        currentStage.videos.push({
          id: randomUUID(),
          name: token.text as string,
          link: '',
          description: '',
        });
      } else if (currentStage.videos.length > 0) {
        const currentVideo = currentStage.videos.at(-1)!;

        if (token.type === 'link') {
          currentVideo.link = token.href as string;
        } else if (token.type === 'text' || token.type === 'paragraph') {
          if (collectingDescription || token.type === 'paragraph') {
            currentVideo.description +=
              (currentVideo.description ? ' ' : '') + token.text;
            collectingDescription = true;
          }
        } else {
          collectingDescription = false;
        }
      }
    }
  }

  return stages;
};

export const createProcessChangedConference = (
  dependencies: Dependencies,
  errors: string[],
) => {
  const { postgres } = dependencies;

  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main, files } = separateContentFiles(
          resource,
          'conference.yml',
        );

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(`Error processing file ${resource?.path}: ${error}`);
          return;
        }

        const id = await transaction<Resource[]>`
              SELECT id FROM content.resources WHERE path = ${resource.path}
            `
          .then(firstRow)
          .then((row) => row?.id);

        if (!id) {
          throw new Error(`Resource not found for path ${resource.path}`);
        }

        let parsed: ConferenceMain | null = null;

        try {
          if (main && main.kind !== 'removed') {
            parsed = yamlToObject<ConferenceMain>(main.data);

            await transaction`
              INSERT INTO content.conferences (
                resource_id, language, name, year, description, builder, website_url, twitter_url
              )
              VALUES (
                ${id}, ${parsed.language}, "", ${parsed.year}, 
                "", ${parsed.builder}, ${parsed.links?.website}, 
                ${parsed.links?.twitter},
              )
              ON CONFLICT (resource_id) DO UPDATE SET
                language = EXCLUDED.language,
                name = EXCLUDED.name,
                year = EXCLUDED.year,
                description = EXCLUDED.description,
                builder = EXCLUDED.builder,
                website_url = EXCLUDED.website_url,
                twitter_url = EXCLUDED.twitter_url
            `;
          }
        } catch (error) {
          errors.push(`Error processing file ${main?.path}: ${error}`);
        }

        for (const file of files.filter((file) =>
          file.path.includes('en.md'),
        )) {
          try {
            // TODO IMPOSSIBLE
            if (file.kind === 'removed') {
              continue;
            }

            const header = matter(file.data, {
              excerpt: false,
            });

            const data = header.data as ConferenceLocalized;

            const stages = extractStages(header.content);

            await transaction`
              INSERT INTO content.conferences (
                resource_id, name, description
              )
              VALUES (
                ${id}, ${data.name}, ${data.description.trim()}
              )
              ON CONFLICT (resource_id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description
            `;

            for (const stage of stages) {
              await transaction`
              INSERT INTO content.conferences_stages (
                stage_id, conference_id, name
              )
              VALUES (
                ${stage.id}, ${id}, ${stage.name}
              )
              ON CONFLICT (stage_id) DO UPDATE SET
                name = EXCLUDED.name,
              `;

              for (const video of stage.videos) {
                await transaction`
                INSERT INTO content.conferences_stages_videos (
                  video_id, stage_id, name, link, description
                )
                VALUES (
                  ${video.id}, ${stage.id}, ${video.name}, ${video.link}, ${video.description.trim()}
                )
                ON CONFLICT (video_id) DO UPDATE SET
                  name = EXCLUDED.name,
                  link = EXCLUDED.link,
                  description = EXCLUDED.description
                `;
              }
            }
          } catch (error) {
            errors.push(`Error processing one file ${file?.path}: ${error}`);
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};

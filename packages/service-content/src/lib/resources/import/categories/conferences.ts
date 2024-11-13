import matter from 'gray-matter';
import { marked } from 'marked';

import { firstRow } from '@blms/database';
import type { Conference, Proofreading, Resource } from '@blms/types';

import type { ProofreadingEntry } from '#src/lib/types.js';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

interface ConferenceMain {
  year: string;
  location: string;
  original_language: string;
  builder?: string;
  language: string[];
  links?: {
    website?: string;
    twitter?: string;
  };
  proofreading: ProofreadingEntry[];
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
  raw_content: string;
}

const extractStages = (markdown: string, id: number): Stage[] => {
  const tokens = marked.lexer(markdown);
  const stages: Stage[] = [];

  let stageId = 0;
  let videoId = 1;

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1) {
      videoId = 1;
      stageId++;

      stages.push({
        id: `${id}_${stageId}`,
        name: token.text as string,
        videos: [],
      });
    } else if (stages.length > 0) {
      const currentStage = stages.at(-1)!;

      if (token.type === 'heading' && token.depth === 2) {
        currentStage.videos.push({
          id: `${id}_${stageId}_${videoId}`,
          name: token.text as string,
          raw_content: '',
        });
        videoId++;
      } else if (currentStage.videos.length > 0) {
        const currentVideo = currentStage.videos.at(-1)!;

        if (token.type === 'text' || token.type === 'paragraph') {
          currentVideo.raw_content += currentVideo.raw_content
            ? '\n' + token.text
            : (token.text as string);
        }
      }
    }
  }

  return stages;
};

export const createProcessChangedConference = (
  { postgres }: Dependencies,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main, files } = separateContentFiles(
          resource,
          'conference.yml',
        );
        if (!main) return;

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(conferences) ${resource?.fullPath}: ${error}`,
          );
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

        let parsedConference: ConferenceMain | null = null;

        try {
          parsedConference = yamlToObject<ConferenceMain>(main.data);

          const result = await transaction<Conference[]>`
              INSERT INTO content.conferences (
                resource_id, languages, name, year, location, original_language, description, builder, website_url, twitter_url
              )
              VALUES (
                ${id}, ${parsedConference.language}, '', ${parsedConference.year.toString().trim()}, ${parsedConference.location.trim()},  ${parsedConference.original_language},
                '', ${parsedConference.builder?.trim()}, ${parsedConference.links?.website?.trim()},
                ${parsedConference.links?.twitter?.trim()}
              )
              ON CONFLICT (resource_id) DO UPDATE SET
                languages = EXCLUDED.languages,
                name = EXCLUDED.name,
                year = EXCLUDED.year,
                location = EXCLUDED.location,
                original_language = EXCLUDED.original_language,
                description = EXCLUDED.description,
                builder = EXCLUDED.builder,
                website_url = EXCLUDED.website_url,
                twitter_url = EXCLUDED.twitter_url
              RETURNING *
            `.then(firstRow);

          // If the resource has proofreads
          if (parsedConference.proofreading) {
            for (const p of parsedConference.proofreading) {
              const proofreadResult = await transaction<Proofreading[]>`
                  INSERT INTO content.proofreading (resource_id, language, last_contribution_date, urgency, reward)
                  VALUES (${result?.resourceId}, ${p.language.toLowerCase()}, ${p.last_contribution_date}, ${p.urgency}, ${p.reward})
                  RETURNING *;
                `.then(firstRow);

              if (p.contributors_id) {
                for (const [index, contrib] of p.contributors_id.entries()) {
                  await transaction`INSERT INTO content.contributors (id) VALUES (${contrib}) ON CONFLICT DO NOTHING`;
                  await transaction`
                      INSERT INTO content.proofreading_contributor(proofreading_id, contributor_id, "order")
                      VALUES (${proofreadResult?.id},${contrib},${index})
                    `;
                }
              }
            }
          }
        } catch (error) {
          errors.push(
            `Error processing file(conferences), ${resource.path} - ${main?.path} (${resource.fullPath}): ${error}`,
          );
        }

        for (const file of files.filter((file) =>
          file.path.includes('en.md'),
        )) {
          try {
            const header = matter(file.data, {
              excerpt: false,
            });

            const data = header.data as ConferenceLocalized;

            const stages = extractStages(header.content, id);

            await transaction`
              INSERT INTO content.conferences (
                resource_id, name, year, location, original_language, description
              )
              VALUES (
                ${id}, ${data.name.trim()}, '', '', '', ${data.description.trim()}
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
                ${stage.id}, ${id}, ${stage.name.trim()}
              )
              ON CONFLICT (stage_id) DO UPDATE SET
                name = EXCLUDED.name
              `;

              for (const video of stage.videos) {
                await transaction`
                INSERT INTO content.conferences_stages_videos (
                  video_id, stage_id, name, raw_content
                )
                VALUES (
                  ${video.id}, ${stage.id}, ${video.name.trim()}, ${video.raw_content.trim()}
                )
                ON CONFLICT (video_id) DO UPDATE SET
                  name = EXCLUDED.name,
                  raw_content = EXCLUDED.raw_content
                `;
              }
            }
          } catch (error) {
            errors.push(
              `Error processing one file (conferences) ${resource.path} - ${file?.path} (${resource.fullPath}): ${error}`,
            );
          }
        }
      })
      .catch(() => {
        return;
      });
  };
};

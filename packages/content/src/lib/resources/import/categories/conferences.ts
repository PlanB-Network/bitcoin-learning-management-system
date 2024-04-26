import { marked } from 'marked';
import type { Token } from 'marked';

import { firstRow } from '@sovereign-university/database';
import type { Resource } from '@sovereign-university/types';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

/** Base conference information, same for all translations */
interface ConferenceMain {
  name: string;
  year: string;
  builder?: string;
  language: string[];
  description?: string;
  links?: {
    website?: string;
    twitter?: string;
  };
}

interface ConferenceStage {
  name: string;
  videos: ConferenceStageVideo[];
}

interface ConferenceStageVideo {
  name: string;
  link: string;
  description: string;
}

// TODO -> Complete this data extractor

// const extractData = (markdown: string): ConferenceStage[] => {
//   const tokens = marked.lexer(markdown);
//   const conferenceStages: ConferenceStage[] = [];
//   let currentStage: ConferenceStage | null = null;

//   for (const token of tokens) {
//     switch (token.type) {
//       case 'heading': {
//         if (token.depth === 1) {
//           currentStage = { name: token.text, videos: [] };
//           conferenceStages.push(currentStage);
//         }

//         if (token.depth === 2 && currentStage) {
//           currentStage.videos.push({
//             title: token.text,
//             videoUrl: '',
//             speakers: [],
//           });
//         }
//         break;
//       }

//       case 'paragraph': {
//         if (currentStage && currentStage.videos.length > 0) {
//           const currentVideo = currentStage.videos.at(-1);
//           const videoMatch = token.text.match(
//             /!\[video]\((https?:\/\/[^)]+)\)/,
//           );
//           if (videoMatch) {
//             currentVideo.videoUrl = videoMatch[1];
//           }
//         }
//         break;
//       }

//       case 'text': {
//         if (currentStage && currentStage.videos.length > 0) {
//           const currentVideo = currentStage.videos.at(-1);
//           const videoDescription = token.text.startsWith('Speaker:');
//           if (videoDescription) {
//             currentVideo.speakers = token.text
//               .replace('Speaker:', '')
//               .split(',')
//               .map((s) => s.trim());
//           }
//         }
//         break;
//       }
//     }
//   }

//   return conferenceStages;
// };

// TODO -> get name and description from markdown as well

export const createProcessChangedConference = (
  dependencies: Dependencies,
  errors: string[],
) => {
  const { postgres } = dependencies;

  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (transaction) => {
        const { main } = separateContentFiles(resource, 'conference.yml');
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

        try {
          if (main && main.kind !== 'removed') {
            const parsed = yamlToObject<ConferenceMain>(main.data);

            await transaction`
              INSERT INTO content.conferences (
                resource_id, language, name, year, description, builder, website_url, twitter_url
              )
              VALUES (
                ${id}, ${parsed.language}, ${parsed.name}, ${parsed.year}, 
                ${parsed.description?.trim()}, ${parsed.builder}, ${parsed.links?.website}, 
                ${parsed.links?.twitter},
              )
              ON CONFLICT (resource_id) DO UPDATE SET
                language = EXCLUDED.language,
                name = EXCLUDED.name,
                year = EXCLUDED.year,
                description = EXCLUDED.description,
                builder = EXCLUDED.builder,
                website_url = EXCLUDED.website_url,
                twitter_url = EXCLUDED.twitter_url,
            `;
          }
        } catch (error) {
          errors.push(`Error processing file ${main?.path}: ${error}`);
        }
      })
      .catch(() => {
        return;
      });
  };
};

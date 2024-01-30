import matter from 'gray-matter';

import { firstRow, sql } from '@sovereign-university/database';
import type { ChangedFile, Tutorial } from '@sovereign-university/types';

import type { Language } from '../../const';
import { Dependencies } from '../../dependencies';
import { ChangedContent } from '../../types';
import {
  getContentType,
  getRelativePath,
  separateContentFiles,
} from '../../utils';

import { createProcessMainFile } from './main';

interface TutorialDetails {
  category: string;
  path: string;
  language?: Language;
}

export interface ChangedTutorial extends ChangedContent {
  name: string;
  category: string;
}

/**
 * Parse course details from path
 *
 * @param path - Path of the file
 * @returns Resource details
 */
export const parseDetailsFromPath = (path: string): TutorialDetails => {
  const pathElements = path.split('/');

  // Validate that the path has at least 3 elements (tutorials/)
  if (pathElements.length < 4) throw new Error('Invalid resource path');

  // If pathElements has 'assets', get the path until 'assets'
  // If not, get the direct parent of the file
  const pathIndex = pathElements.indexOf('assets');
  const pathEnd = pathIndex > -1 ? pathIndex : pathElements.length - 1;
  const tutorialElements = pathElements.slice(0, pathEnd);

  return {
    category: pathElements[1],
    path: tutorialElements.join('/'),
    language: pathElements.at(-1)?.replace(/\..*/, '') as Language,
  };
};

export const groupByTutorial = (files: ChangedFile[], errors: string[]) => {
  const tutorialsFiles = files.filter(
    (item) => getContentType(item.path) === 'tutorials',
  );

  const groupedTutorials = new Map<string, ChangedTutorial>();

  for (const file of tutorialsFiles) {
    try {
      const {
        category,
        path: tutorialPath,
        language,
      } = parseDetailsFromPath(file.path);

      const course: ChangedTutorial = groupedTutorials.get(tutorialPath) || {
        type: 'tutorials',
        name: tutorialPath.split('/').at(-1) as string,
        category,
        path: tutorialPath,
        files: [],
      };

      course.files.push({
        ...file,
        path: getRelativePath(file.path, tutorialPath),
        language,
      });

      groupedTutorials.set(tutorialPath, course);
    } catch {
      errors.push(`Unsupported path ${file.path}, skipping file...`);
    }
  }

  return Array.from(groupedTutorials.values());
};

export const createProcessChangedTutorial =
  (dependencies: Dependencies, errors: string[]) =>
  async (tutorial: ChangedTutorial) => {
    const { postgres } = dependencies;

    const { main, files } = separateContentFiles(tutorial, 'tutorial.yml');

    return postgres
      .begin(async (transaction) => {
        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(tutorial, main);
        } catch (error) {
          errors.push(`Error processing file ${tutorial?.path}: ${error}`);
          return;
        }

        const id = await transaction<Tutorial[]>`
          SELECT id FROM content.tutorials WHERE path = ${tutorial.path}
        `
          .then(firstRow)
          .then((row) => row?.id);

        if (!id) {
          throw new Error(`Tutorial not found for path ${tutorial.path}`);
        }

        for (const file of files) {
          try {
            if (file.kind === 'removed') {
              // If file was deleted, delete the translation from the database

              await transaction`
            DELETE FROM content.tutorials_localized
            WHERE tutorial_id = ${id} AND language = ${file.language}
          `;

              continue;
            }

            const header = matter(file.data, { excerpt: false });

            await transaction`
          INSERT INTO content.tutorials_localized (
            tutorial_id, language, title, description, raw_content
          )
          VALUES (
            ${id},
            ${file.language},
            ${header.data['name']},
            ${header.data['description']},
            ${header.content.trim()}
          )
          ON CONFLICT (tutorial_id, language) DO UPDATE SET
            title = EXCLUDED.title,
            raw_content = EXCLUDED.raw_content
        `;
          } catch (error) {
            errors.push(`Error processing file ${file?.path}: ${error}`);
          }
        }
      })
      .catch(() => {
        return;
      });
  };

export const createProcessDeleteTutorials =
  (dependencies: Dependencies, errors: string[]) =>
  async (sync_date: number) => {
    const { postgres } = dependencies;

    try {
      await postgres.exec(
        sql`DELETE FROM content.tutorials WHERE last_sync < ${sync_date} 
      `,
      );
    } catch (error) {
      errors.push(`Error deleting tutorials`);
    }

    return;
  };

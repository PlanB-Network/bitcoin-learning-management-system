import { asTransaction, firstRow } from '@blms/database';
import type { Calendar, Proofreading, Resource } from '@blms/types';

import type { ProofreadingEntry } from '#src/lib/types.js';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { BaseResource, ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

interface CalendarMain {
  id: string;
  calendar_date: string;
  original_language: string;
  proofreading: ProofreadingEntry[];
}

interface CalendarLocal extends BaseResource {
  title: string;
}

export const createProcessChangedCalendar = (
  { postgres }: Pick<Dependencies, 'postgres'>,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (_tx) => {
        const transaction = asTransaction(_tx);
        const { main, files } = separateContentFiles(resource, 'calendar.yml');
        if (!main) return;

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(calendar) ${resource?.fullPath}: ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
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

        let parsedCalendar: CalendarMain | null = null;
        try {
          parsedCalendar = await yamlToObject<CalendarMain>(main);

          const result = await transaction<Calendar[]>`
              INSERT INTO content.calendar (resource_id, date, original_language)
              VALUES (${id}, ${parsedCalendar.calendar_date}, ${parsedCalendar.original_language})
              ON CONFLICT (resource_id) DO UPDATE SET
                date = EXCLUDED.date,
                original_language = EXCLUDED.original_language
              RETURNING *
            `.then(firstRow);

          // If the resource has proofreads
          if (parsedCalendar.proofreading) {
            for (const p of parsedCalendar.proofreading) {
              const proofreadResult = await transaction<Proofreading[]>`
                  INSERT INTO content.proofreading (resource_id, language, last_contribution_date, urgency, reward)
                  VALUES (${result?.resourceId}, ${p.language.toLowerCase()}, ${p.last_contribution_date}, ${p.urgency}, ${Math.round(p.reward * 100)})
                  RETURNING *;
                `.then(firstRow);

              if (p.contributor_names) {
                for (const [index, contrib] of p.contributor_names.entries()) {
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
            `Error processing main file ${main?.path} (${resource.fullPath}): ${error}`,
          );
          return;
        }

        for (const file of files) {
          try {
            const parsed = await yamlToObject<CalendarLocal>(file);

            await transaction`
              INSERT INTO content.calendar_localized (
                resource_id, language, title
              )
              VALUES (
                ${id},
                ${file.language},
                ${parsed.title}
              )
              ON CONFLICT (resource_id, language) DO UPDATE SET
                title = EXCLUDED.title
            `.then(firstRow);
          } catch (error) {
            errors.push(
              `Error processing one file ${id} ${file?.path} (${resource.fullPath}): ${error}`,
            );
            return;
          }
        }
      })
      .catch((error) => {
        errors.push(`Error during transaction: ${error}`);
      });
  };
};

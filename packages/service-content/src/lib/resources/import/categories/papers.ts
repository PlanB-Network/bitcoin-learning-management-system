import { asTransaction, firstRow, type TransactionSql } from '@blms/database';
import type { S3Service } from '@blms/s3';
import type { ChangedFile, Resource } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { separateContentFiles, yamlToObject } from '../../../utils.js';
import type { ChangedResource } from '../index.js';
import { createProcessMainFile } from '../main.js';

/** Base paper information */
interface PaperMain {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  original_language: string;
  topics?: string[];
  publication_date?: string | Date;
  source: string;
  paper_type: string;
  pdf_url: string;
}

export const createProcessChangedPaper = (
  { postgres, s3 }: Pick<Dependencies, 'postgres' | 's3'>,
  errors: string[],
) => {
  return async (resource: ChangedResource) => {
    return postgres
      .begin(async (_tx) => {
        const transaction = asTransaction(_tx);
        const { main, files } = separateContentFiles(resource, 'paper.yml');

        if (!main) return;

        try {
          const processMainFile = createProcessMainFile(transaction);
          await processMainFile(resource, main);
        } catch (error) {
          errors.push(
            `Error processing file(paper) ${resource?.path} (${resource.fullPath}): ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
          );
          return;
        }

        const resourceId = await transaction<Resource[]>`
              SELECT id FROM content.resources WHERE path = ${resource.path}
            `
          .then(firstRow)
          .then((row) => row?.id);

        if (!resourceId) {
          throw new Error(`Resource not found for path ${resource.path}`);
        }

        try {
          const parsed = await yamlToObject<PaperMain>(main);

          await transaction`
            INSERT INTO content.research_papers (
              resource_id,
              id,
              title,
              abstract,
              authors,
              publication_date,
              source,
              language,
              topics,
              type,
              paper_url,
              bib_url
            )
            VALUES (
              ${resourceId},
              ${parsed.id},
              ${parsed.title},
              ${parsed.abstract},
              ${parsed.authors},
              ${parsed.publication_date ?? null},
              ${parsed.source},
              ${parsed.original_language},
              ${parsed.topics ?? null},
              ${parsed.paper_type},
              ${parsed.pdf_url},
              ''
            )
            ON CONFLICT (resource_id) DO UPDATE SET
              title = EXCLUDED.title,
              abstract = EXCLUDED.abstract,
              authors = EXCLUDED.authors,
              publication_date = EXCLUDED.publication_date,
              source = EXCLUDED.source,
              language = EXCLUDED.language,
              topics = EXCLUDED.topics,
              type = EXCLUDED.type,
              paper_url = EXCLUDED.paper_url;
          `;
        } catch (error) {
          errors.push(
            `Error processing file(papers) ${main?.path} (${resource.fullPath}): ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
          );
          return;
        }

        const bibFile = files.find((file) => file.path.endsWith('.bib'));

        if (bibFile) {
          try {
            const processBibFile = createProcessBibFile(transaction, s3);
            await processBibFile(bibFile, resourceId);
          } catch (error) {
            console.log(`Error processing file(Bib) ${bibFile.path}: ${error}`);
            errors.push(
              `Error processing file(Bib) ${bibFile.path}: ${error}${(error as any).detail ? ` - Detail: ${(error as any).detail}` : ''}`,
            );
          }
        }
      })
      .catch((error) => {
        errors.push(`Error during transaction: ${error}`);
      });
  };
};

export const createProcessBibFile = (
  transaction: TransactionSql,
  s3: S3Service,
) => {
  return async (file: ChangedFile, resourceId: string) => {
    const fileBuffer = await file.load();

    const fileName = file.path.split('/').pop();
    if (!fileName) throw new Error('Invalid file path');

    const s3FilePath = `resources/papers/${resourceId}/${fileName}`;

    // Check if the file is already synced on s3
    const metadata = await s3.metadata(s3FilePath);

    if (metadata?.commit === file.commit) {
      console.log(`[sync] Already processed file: ${s3FilePath}`, metadata);
    } else {
      console.log('put on s3', s3FilePath);
      const mimeType = 'application/x-bibtex';

      const fileMetadata = { commit: file.commit };

      await s3.put(s3FilePath, Buffer.from(fileBuffer), {
        contentType: mimeType,
        metadata: fileMetadata,
      });
    }

    await transaction`
      UPDATE content.research_papers
      SET
        bib_url = ${s3FilePath}
      WHERE
        resource_id = ${resourceId}
    `;
  };
};

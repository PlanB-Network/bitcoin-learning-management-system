import { sql } from '@sovereign-university/database';
import type { JoinedBCertificateResults } from '@sovereign-university/types';

export const getBCertificateResultsQuery = (uid: string) => {
  return sql<JoinedBCertificateResults>`
    SELECT
      r.id,
      r.path,
      wl.language,
      w.original_word,
      w.file_name,
      w.related_words,
      wl.term,
      wl.definition,
      r.last_updated,
      r.last_commit,
      COALESCE((SELECT ARRAY_AGG(DISTINCT t.name)
        FROM content.resource_tags rt
        JOIN content.tags t ON t.id = rt.tag_id
        WHERE rt.resource_id = r.id), ARRAY[]::text[]) AS tags
    FROM content.glossary_words w
    JOIN content.resources r ON r.id = w.resource_id
    JOIN content.glossary_words_localized wl ON wl.glossary_word_id = w.resource_id
    GROUP BY
      r.id,
      wl.language,
      w.original_word,
      w.file_name,
      w.related_words,
      wl.term,
      wl.definition
  `;
};

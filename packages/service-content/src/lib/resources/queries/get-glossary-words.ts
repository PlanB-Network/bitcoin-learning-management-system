import { sql } from '@blms/database';
import type { JoinedGlossaryWord } from '@blms/types';

export const getGlossaryWordsQuery = (language?: string) => {
  return sql<JoinedGlossaryWord[]>`
    SELECT 
      r.id, 
      r.path, 
      wl.language, 
      w.original_word,
      w.file_name,
      w.related_words,
      w.original_language,
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
    ${language ? sql`WHERE wl.language = ${language}` : sql`WHERE wl.language = 'en'`}
    GROUP BY 
      r.id, 
      wl.language, 
      w.original_word,
      w.file_name,
      w.related_words,
      w.original_language,
      wl.term,
      wl.definition
  `;
};

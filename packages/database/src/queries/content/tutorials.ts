import { JoinedTutorial } from '@sovereign-academy/types';

import { sql } from '../../index';

export const getTutorialsQuery = (language?: string) => {
  return sql<JoinedTutorial[]>`
    SELECT 
      t.id, t.path, tl.language, t.level, t.category, t.subcategory, tl.name, 
      t.last_updated, t.last_commit, ARRAY_AGG(tg.name) AS tags
    FROM content.tutorials t
    JOIN content.tutorials_localized tl ON t.id = tl.tutorial_id
    LEFT JOIN content.tutorial_tags tt ON tt.tutorial_id = t.id
    LEFT JOIN content.tags tg ON tg.id = tt.tag_id
    ${language ? sql`WHERE tl.language = ${language}` : sql``}
    GROUP BY t.id, tl.language, t.level, t.category, t.subcategory, tl.name,
    t.last_updated, t.last_commit
  `;
};

export const getTutorialQuery = (id: number, language?: string) => {
  return sql<JoinedTutorial[]>`
    SELECT 
      t.id, t.path, tl.language, t.level, t.category, t.subcategory, tl.name, 
      tl.raw_content, t.last_updated, t.last_commit, ARRAY_AGG(tg.name) AS tags
    FROM content.tutorials t
    JOIN content.tutorials_localized tl ON t.id = tl.tutorial_id
    LEFT JOIN content.tutorial_tags tt ON tt.tutorial_id = t.id
    LEFT JOIN content.tags tg ON tg.id = tt.tag_id
    WHERE t.id = ${id} 
    ${language ? sql`AND tl.language = ${language}` : sql``}
    GROUP BY t.id, tl.language, t.level, t.category, t.subcategory, tl.name,
    tl.raw_content, t.last_updated, t.last_commit
  `;
};

import { sql } from '@blms/database';
import type { JoinedTutorialLight } from '@blms/types';

type TutorialMeta = Pick<
  JoinedTutorialLight,
  | 'id'
  | 'path'
  | 'name'
  | 'language'
  | 'category'
  | 'title'
  | 'description'
  | 'lastUpdated'
  | 'lastCommit'
>;

export const getTutorialMetaQuery = (id: string, language: string) => {
  return sql<TutorialMeta[]>`
      SELECT
          t.id,
          t.path,
          t.name,
          tl.language,
          t.category,
          tl.title,
          tl.description,
          t.last_updated,
          t.last_commit
      FROM content.tutorials t
      JOIN content.tutorials_localized tl ON t.id = tl.tutorial_id
      WHERE id = ${id}
        AND tl.language = LOWER(${language})
  `;
};

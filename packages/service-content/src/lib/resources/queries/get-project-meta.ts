import { sql } from '@blms/database';
import type { JoinedProject } from '@blms/types';

type ProjectMeta = Pick<
  JoinedProject,
  'id' | 'path' | 'name' | 'language' | 'description' | 'lastCommit'
>;

export const getProjectMetaQuery = (id: number, language?: string) => {
  return sql<ProjectMeta[]>`
    SELECT
      r.id,
      r.path,
      b.name,
      bl.language,
      bl.description,
      r.last_commit
    FROM content.projects b
    JOIN content.resources r ON r.id = b.resource_id
    JOIN content.projects_localized bl ON bl.id = b.id
    WHERE r.id = ${id}
    ${language ? sql`AND bl.language = LOWER(${language})` : sql``}
  `;
};

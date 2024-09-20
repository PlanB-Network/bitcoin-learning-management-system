import { sql } from '@blms/database';
import type { JoinedConference } from '@blms/types';

type ConferenceMeta = Pick<
  JoinedConference,
  | 'id'
  | 'path'
  | 'name'
  | 'description'
  | 'languages'
  | 'lastUpdated'
  | 'lastCommit'
>;

export const getConferenceMetaQuery = (resourceId: number) => {
  return sql<ConferenceMeta[]>`
    SELECT
      r.id,
      r.path,
      c.name,
      c.description,
      c.languages,
      r.last_updated,
      r.last_commit
    FROM content.conferences c
    JOIN content.resources r ON r.id = c.resource_id
    WHERE r.id = ${resourceId}
  `;
};

import { sql } from '@blms/database';
import type { JoinedEducatorContent } from '@blms/types';

export const getEducatorContentQuery = (
  language?: string,
  status?: string,
  id?: string,
  uid?: string,
  originalId?: string,
) => {
  return sql<JoinedEducatorContent[]>`
    SELECT
      ec.id,
      ec.type,
      ec.cover,
      ec.language,
      ec.title,
      ec.description,
      ec.status,
      ec.uid,
      ec.downloads,
      ec.published_at AS "publishedAt",
      ec.original_id AS "originalId",
      u.display_name AS "displayName",
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', ecl.id,
              'educatorContentId', ecl.educator_content_id,
              'url', ecl.url,
              'label', ecl.label
            )
          ),
          '[]'
        )
        FROM content.educator_content_links ecl
        WHERE ecl.educator_content_id = ec.id
      ) AS links,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', ecf.id,
              'educatorContentId', ecf.educator_content_id,
              'path', ecf.path,
              'name', ecf.name,
              'mimeType', ecf.mime_type,
              'size', ecf.size
            )
          ),
          '[]'
        )
        FROM content.educator_content_files ecf
        WHERE ecf.educator_content_id = ec.id
      ) AS files
    FROM content.educator_contents ec
    LEFT JOIN users.accounts u ON ec.uid = u.uid
    WHERE ${language ? sql`ec.language = ${language}` : sql`TRUE`}
      AND ${status ? sql`ec.status = ${status}` : sql`TRUE`}
      AND ${id ? sql`ec.id = ${id}` : sql`TRUE`}
      AND ${uid ? sql`ec.uid = ${uid}` : sql`TRUE`}
      AND ${originalId ? sql`ec.original_id = ${originalId}` : sql`TRUE`}
    GROUP BY ec.id, u.display_name
  `;
};

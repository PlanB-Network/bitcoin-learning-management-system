import { sql } from '@blms/database';
import type { JoinedEducatorContent } from '@blms/types';

export const createEducatorContentQuery = (
  input: Omit<JoinedEducatorContent, 'id' | 'links' | 'files'> & {
    links?: { url: string }[];
    files?: { path: string; name: string; mime_type: string; size: number }[];
    status?: string;
    originalId?: string | null;
  },
) => {
  return sql<JoinedEducatorContent[]>`
      WITH inserted_content AS (
        INSERT INTO content.educator_contents (
          type, cover, language, title, description, uid, original_id, status, published_at, license
        ) VALUES (
          ${input.type}, ${input.cover}, ${input.language}, ${input.title}, ${input.description}, ${input.uid}, ${input.originalId}, ${input.status},
          CASE WHEN ${input.status} = 'published' THEN NOW() ELSE NULL END,
          ${input.license}
        )
        RETURNING id, type, cover, language, title, description, uid, original_id, status, license
      ),
      inserted_links AS (
        INSERT INTO content.educator_content_links (
          educator_content_id, url
        )
        SELECT
          ic.id,
          l.url
        FROM inserted_content ic,
        json_to_recordset(${sql.json(input.links || [])}::json) AS l(url text)
        RETURNING id, educator_content_id, url
      ),
      inserted_files AS (
        INSERT INTO content.educator_content_files (
          educator_content_id, path, name, mime_type, size
        )
        SELECT
          ic.id,
          f.path,
          f.name,
          f.mime_type,
          f.size
        FROM inserted_content ic,
        json_to_recordset(${sql.json(input.files || [])}::json) AS f(path text, name text, mime_type text, size int)
        RETURNING id, educator_content_id, path, name, mime_type, size
      )
      SELECT
        ic.*,
        (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', il.id,
                'educatorContentId', il.educator_content_id,
                'url', il.url
              )
            ),
            '[]'
          )
          FROM inserted_links il
          WHERE il.educator_content_id = ic.id
        ) AS links,
        (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', if.id,
                'educatorContentId', if.educator_content_id,
                'path', if.path,
                'name', if.name,
                'mime_type', if.mime_type,
                'size', if.size
              )
            ),
            '[]'
          )
          FROM inserted_files if
          WHERE if.educator_content_id = ic.id
        ) AS files
      FROM inserted_content ic
      GROUP BY ic.id, ic.type, ic.cover, ic.language, ic.title, ic.description, ic.uid, ic.original_id, ic.status, ic.license
    `;
};

export const updateEducatorContentQuery = (
  input: Partial<JoinedEducatorContent> & {
    id: string;
    links?: { url: string }[];
    files?: { path: string; name: string; mime_type: string; size: number }[];
    uid?: string;
  },
) => {
  return sql<JoinedEducatorContent[]>`
    WITH updated_content AS (
      UPDATE content.educator_contents
      SET
        type = COALESCE(${input.type}, type),
        cover = COALESCE(${input.cover}, cover),
        language = COALESCE(${input.language}, language),
        title = COALESCE(${input.title}, title),
        description = COALESCE(${input.description}, description),
        status = COALESCE(${input.status}, status),
        license = COALESCE(${input.license}, license),
        published_at = CASE WHEN ${input.status} = 'published' THEN NOW() ELSE published_at END
      WHERE id = ${input.id}
      ${input.uid ? sql`AND uid = ${input.uid}` : sql``}
      RETURNING id, type, cover, language, title, description, uid, status, original_id, license
    ),
    deleted_links AS (
      DELETE FROM content.educator_content_links
      WHERE educator_content_id = ${input.id}
      AND EXISTS (SELECT 1 FROM updated_content)
    ),
    inserted_links AS (
      INSERT INTO content.educator_content_links (
        educator_content_id, url
      )
      SELECT
        ${input.id},
        l.url
      FROM
      json_to_recordset(${sql.json(input.links || [])}::json) AS l(url text)
      WHERE EXISTS (SELECT 1 FROM updated_content)
      RETURNING id, educator_content_id, url
    ),
    deleted_files AS (
      DELETE FROM content.educator_content_files
      WHERE educator_content_id = ${input.id}
      AND EXISTS (SELECT 1 FROM updated_content)
    ),
    inserted_files AS (
      INSERT INTO content.educator_content_files (
        educator_content_id, path, name, mime_type, size
      )
      SELECT
        ${input.id},
        f.path,
        f.name,
        f.mime_type,
        f.size
      FROM
      json_to_recordset(${sql.json(input.files || [])}::json) AS f(path text, name text, mime_type text, size int)
      WHERE EXISTS (SELECT 1 FROM updated_content)
      RETURNING id, educator_content_id, path, name, mime_type, size
    )
    SELECT
      uc.*,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', il.id,
              'educatorContentId', il.educator_content_id,
              'url', il.url
            )
          ),
          '[]'
        )
        FROM inserted_links il
        WHERE il.educator_content_id = uc.id
      ) AS links,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object(
              'id', if.id,
              'educatorContentId', if.educator_content_id,
              'path', if.path,
              'name', if.name,
              'mime_type', if.mime_type,
              'size', if.size
            )
          ),
          '[]'
        )
        FROM inserted_files if
        WHERE if.educator_content_id = uc.id
      ) AS files
    FROM updated_content uc
    GROUP BY uc.id, uc.type, uc.cover, uc.language, uc.title, uc.description, uc.uid, uc.status, uc.original_id, uc.license
  `;
};
export const deleteEducatorContentQuery = (id: string) => {
  return sql`
    DELETE FROM content.educator_contents
    WHERE id = ${id}
  `;
};

import { sql } from '@blms/database';

export const approveEducatorContentQuery = (id: string) => {
  return sql`
    UPDATE content.educator_contents
    SET status = 'published', published_at = NOW()
    WHERE id = ${id}
  `;
};

export const mergeEducatorContentQuery = (
  draftId: string,
  originalId: string,
) => {
  return sql`
    WITH draft_content AS (
      SELECT * FROM content.educator_contents WHERE id = ${draftId}
    ),
    deleted_old_files AS (
      DELETE FROM content.educator_content_files
      WHERE educator_content_id = ${originalId}
    ),
    deleted_old_links AS (
      DELETE FROM content.educator_content_links
      WHERE educator_content_id = ${originalId}
    ),
    moved_files AS (
      UPDATE content.educator_content_files
      SET educator_content_id = ${originalId}
      WHERE educator_content_id = ${draftId}
    ),
    moved_links AS (
      UPDATE content.educator_content_links
      SET educator_content_id = ${originalId}
      WHERE educator_content_id = ${draftId}
    ),
    deleted_draft AS (
      DELETE FROM content.educator_contents
      WHERE id = ${draftId}
    )
    UPDATE content.educator_contents
    SET
      type = draft.type,
      cover = draft.cover,
      language = draft.language,
      title = draft.title,
      description = draft.description,
      status = 'published',
      published_at = NOW()
    FROM draft_content AS draft
    WHERE content.educator_contents.id = ${originalId};
  `;
};

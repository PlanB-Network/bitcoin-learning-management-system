import { sql } from '@blms/database';
import type { JoinedEvent } from '@blms/types';

export const getLectureQuery = (id: string) => {
  return sql<JoinedEvent[]>`
    SELECT
      e.*,
      COALESCE(p.name, '') AS professor_name,
      COALESCE(ta.tags, ARRAY[]::text[]) AS tags,
      COALESCE(la.languages, ARRAY[]::text[]) AS languages
    FROM content.events e

    -- Lateral join for professor
    LEFT JOIN LATERAL (
      SELECT pr.name as name
      FROM content.professors pr
      WHERE pr.id = e.professor
    ) p ON TRUE

    -- Lateral join for tags
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(t.name) AS tags
      FROM content.event_tags et
      JOIN content.tags t ON t.id = et.tag_id
      WHERE et.event_id = e.id
    ) ta ON TRUE

    -- Lateral join for language
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(el.language) AS languages
      FROM content.event_languages el
      WHERE el.event_id = e.id
    ) la ON TRUE

    WHERE id = ${id};
  `;
};

export const getLecturePaymentQuery = (id: string, uid: string) => {
  return sql`
    SELECT *
    FROM users.event_payment
    WHERE event_id = ${id}
    AND uid = ${uid}
    AND payment_status = 'paid'
    ;
  `;
};

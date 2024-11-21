import { sql } from '@blms/database';
import type { JoinedEvent } from '@blms/types';

export const getRecentEventsQuery = () => {
  return sql<JoinedEvent[]>`
    SELECT
      e.*,
      COALESCE(ta.tags, ARRAY[]::text[]) AS tags,
      COALESCE(la.languages, ARRAY[]::text[]) AS languages
    FROM content.events e

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

    WHERE e.start_date >= NOW() - INTERVAL '3 months'

    GROUP BY e.id, ta.tags, la.languages
  `;
};

export const getUpcomingEventQuery = () => {
  return sql<JoinedEvent[]>`
    SELECT
      e.*,
      COALESCE(ta.tags, ARRAY[]::text[]) AS tags,
      COALESCE(la.languages, ARRAY[]::text[]) AS languages
    FROM content.events e

    -- Lateral join for tags
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(t.name) AS tags
      FROM content.event_tags et
      JOIN content.tags t ON t.id = et.tag_id
      WHERE et.event_id = e.id
    ) ta ON TRUE

    -- Lateral join for languages
    LEFT JOIN LATERAL (
      SELECT ARRAY_AGG(el.language) AS languages
      FROM content.event_languages el
      WHERE el.event_id = e.id
    ) la ON TRUE

    WHERE (
      (e.start_date <= NOW() AND e.end_date >= NOW())
      OR
      e.start_date > NOW()
    )
    ORDER BY e.start_date ASC

    LIMIT 1
  `;
};

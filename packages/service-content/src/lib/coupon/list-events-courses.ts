import { sql } from '@blms/database';

import type { Dependencies } from '../dependencies.js';

interface ListItem {
  id: string;
  name: string;
  type: string;
}

const listEventsAndCourses = () => {
  return sql<ListItem[]>`
    WITH courses AS (
      SELECT
        cl.course_id AS id,
        'course' AS type,
        cl.name
      FROM content.courses_localized cl
      JOIN content.courses c ON c.id = cl.course_id
      WHERE c.requires_payment = true
        AND (cl.course_id,
          CASE
            WHEN cl.language = 'en' THEN 1
            ELSE 2
          END) IN (
          SELECT course_id, MIN(
            CASE
              WHEN language = 'en' THEN 1
              ELSE 2
            END
          )
          FROM content.courses_localized
          GROUP BY course_id
        )
    ),
    events AS (
      SELECT
        id::text AS id,
        'event' AS type,
        name
      FROM content.events
      WHERE price_dollars > 0
    )
    SELECT type, id, name
    FROM (
      SELECT id, type, name FROM courses
      UNION
      SELECT id, type, name FROM events
    ) combined_results
    ORDER BY type, id;
  `;
};

export const createListEventsAndCourses = ({ postgres }: Dependencies) => {
  return () => postgres.exec(listEventsAndCourses());
};

import { sql } from '@blms/database';

export const assignRankingToAllUsersQuery = (courseId: string) => {
  return sql`
    WITH ranked_users AS (
      SELECT
        cp.uid,
        cp.course_id,
        cp.total_score,
        ROW_NUMBER() OVER (
          ORDER BY
            CASE WHEN cp.total_score IS NULL THEN 1 ELSE 0 END,
            cp.total_score DESC NULLS LAST,
            RANDOM()
        ) as new_ranking
      FROM users.course_progress cp
      WHERE cp.course_id = ${courseId}
    )
    UPDATE users.course_progress cp
    SET ranking = ru.new_ranking
    FROM ranked_users ru
    WHERE cp.uid = ru.uid
      AND cp.course_id = ru.course_id
  `;
};

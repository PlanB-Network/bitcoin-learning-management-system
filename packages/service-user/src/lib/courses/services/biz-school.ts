import { sql } from '@blms/database';
import type { Dependencies } from '#src/dependencies.js';

export const createSelectBizSchoolStudentsForAssignments = ({
  postgres,
}: Dependencies) => {
  return postgres.exec(sql`
    WITH top100 AS (
      SELECT
        uid,
        COALESCE(MAX(CASE WHEN chapter_id = '6065ea4e-2675-11f0-b6ab-bb5e1522cb78' THEN score END), 0)
        + 2 * COALESCE(MAX(CASE WHEN chapter_id = '9a307a50-2675-11f0-a893-57c148082c1f' THEN score END), 0)
          AS new_score
      FROM users.exam_attempts
      WHERE chapter_id IN (
        '6065ea4e-2675-11f0-b6ab-bb5e1522cb78',
        '9a307a50-2675-11f0-a893-57c148082c1f'
      )
      GROUP BY uid
      ORDER BY new_score DESC
      LIMIT 100
    )
    UPDATE users.course_progress cp
    SET is_selected_for_assignment = true
    FROM top100 t
    WHERE cp.uid = t.uid AND cp.course_id = 'c762773a-9017-4129-bc0e-06adf86050ef';
  `);
};

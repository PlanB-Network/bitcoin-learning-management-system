import { sql } from '@blms/database';

import type { Dependencies } from '#src/lib/dependencies.js';

export const createRefreshCoursesRatings = (ctx: Dependencies) => {
  const query = sql`
    UPDATE content.courses c
    SET
        sum_of_all_rating = q.sum,
        number_of_rating = q.count
    FROM (
        SELECT course_id, SUM(general) AS sum, COUNT(*) AS count
        FROM users.course_review
        GROUP BY course_id
    ) q
    WHERE c.id = q.course_id;
  `;

  return () => {
    console.log('Refreshing courses ratings');

    return ctx.postgres.exec(query).then(() => true);
  };
};

export const createRefreshCourseRating = (ctx: Dependencies) => {
  return (courseId: string) => {
    const query = sql`
      UPDATE content.courses c
      SET
          sum_of_all_rating = q.sum,
          number_of_rating = q.count
      FROM (
          SELECT course_id, SUM(general) AS sum, COUNT(*) AS count
          FROM users.course_review
          WHERE course_id = ${courseId}
          GROUP BY course_id
      ) q
      WHERE c.id = q.course_id;
    `;

    return ctx.postgres.exec(query).then(() => true);
  };
};

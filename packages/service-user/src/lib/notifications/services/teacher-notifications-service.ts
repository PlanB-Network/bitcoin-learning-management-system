import { sql } from '@blms/database';
import type { Dependencies } from '#src/dependencies.js';

export const createTeacherNotificationsService = async (ctx: Dependencies) => {
  const getCourseCoordinatorsInfos = async (courseId: string) => {
    const result = await ctx.postgres.exec(
      sql`
        SELECT ua.email, ua.display_name
        FROM content.course_professors cp
        JOIN users.accounts ua ON cp.professor_id = ua.professor_id
        WHERE cp.course_id = ${courseId}
        AND cp.is_coordinator = TRUE
        AND ua.email IS NOT NULL
      `,
    );

    return result;
  };

  const getNewStudentsCount = async (
    courseId: string,
    interval: '24 hours' | '1 month' = '24 hours',
  ) => {
    const intervalSql =
      interval === '24 hours'
        ? sql`NOW() - INTERVAL '24 hours'`
        : sql`NOW() - INTERVAL '1 month'`;

    const result = await ctx.postgres.exec(
      sql`
      SELECT COUNT(*) AS count
      FROM users.course_progress cp
      WHERE cp.course_id = ${courseId}
      AND cp.start_date >= ${intervalSql}
      `,
    );

    return result.length > 0 ? Number.parseInt(result[0].count, 10) : 0;
  };

  const getNewSucceededExamsCount = async (courseId: string) => {
    const result = await ctx.postgres.exec(
      sql`
        SELECT COUNT(*) AS count
        FROM users.exam_attempts ea
        WHERE ea.course_id = ${courseId}
        AND ea.succeeded = TRUE
        AND ea.finished_at >= NOW() - INTERVAL '1 month'
      `,
    );

    return result.length > 0 ? Number.parseInt(result[0].count, 10) : 0;
  };

  const getNewCourseReviewsCount = async (courseId: string) => {
    const result = await ctx.postgres.exec(
      sql`
        SELECT COUNT(*) AS count
        FROM users.course_review cr
        WHERE cr.course_id = ${courseId}
        AND cr.created_at >= NOW() - INTERVAL '1 month'
      `,
    );
    return result.length > 0 ? Number.parseInt(result[0].count, 10) : 0;
  };

  return {
    getCourseCoordinatorsInfos,
    getNewCourseReviewsCount,
    getNewStudentsCount,
    getNewSucceededExamsCount,
  };
};

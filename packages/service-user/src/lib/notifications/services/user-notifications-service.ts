import { sql } from '@blms/database';
import type { Dependencies } from '#src/dependencies.js';

export const createUserNotificationsService = async (ctx: Dependencies) => {
  const getUidsByCourse = (courseId: string) => {
    return ctx.postgres.exec(
      sql`
        SELECT uid
        FROM users.course_progress
        WHERE course_id = ${courseId};
        `,
    );
  };

  return {
    getUidsByCourse,
  };
};

import { firstRow, rejectOnEmpty, sql } from '@blms/database';

import type { Dependencies } from '../../dependencies.js';
import { getUserProfessorIdQuery } from '../queries/get-user-professor-id.js';

interface CheckCoordinatorParams {
  userId: string;
  courseId?: string;
  code?: string;
}

export const createCheckCoordinator = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return async ({
    userId,
    courseId,
    code,
  }: CheckCoordinatorParams): Promise<boolean> => {
    const teacher = await postgres
      .exec(getUserProfessorIdQuery(userId))
      .then(firstRow)
      .then(rejectOnEmpty);

    const isCourseCoordinator = await postgres
      .exec(sql<{ id: string }[]>`
        SELECT cp.professor_id as id
        FROM content.course_professors cp
        ${code ? sql`JOIN content.coupon_code cc ON cc.item_id = cp.course_id` : sql``}
        WHERE ${courseId ? sql`cp.course_id = ${courseId}` : code ? sql`cc.code = ${code}` : sql``}
          AND cp.professor_id = ${teacher.professorId}
          AND cp.is_coordinator = true
        LIMIT 1
        `)
      .then((rows) => rows.length > 0);

    return isCourseCoordinator;
  };
};

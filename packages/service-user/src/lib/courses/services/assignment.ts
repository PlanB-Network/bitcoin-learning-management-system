import { firstRow, sql } from '@blms/database';
import type { CourseAssignment } from '@blms/types';
import type { Dependencies } from '#src/dependencies.js';

export const createAssignSingleAssignmentToCourseStudents = async ({
  postgres,
  courseId,
}: Dependencies & { courseId: string }) => {
  console.log('[Assign single assignment] === START for course:', courseId);

  // Get the first/only assignment for this course
  const assignment = await postgres
    .exec(sql<CourseAssignment[]>`
        SELECT ca.*
        FROM content.course_assignment ca
        WHERE ca.course_id = ${courseId}
        LIMIT 1;
      `)
    .then(firstRow);

  if (!assignment) {
    console.log(
      '[Assign single assignment] No assignment found for course:',
      courseId,
    );
    return;
  }

  console.log(
    '[Assign single assignment] Assignment found:',
    assignment.id,
    assignment.description,
  );

  const students = await postgres.exec(sql<{ uid: string }[]>`
      SELECT cp.uid
      FROM users.course_progress cp
      WHERE cp.course_id = ${courseId}
        AND cp.is_selected_for_assignment = false
    `);

  console.log('[Assign single assignment] Students count:', students.length);

  if (students.length > 0) {
    const studentUids = students.map((student) => student.uid);
    console.log(
      `[Assign single assignment] Assigning ${assignment.id} to ${students.length} students.`,
    );

    await postgres.exec(sql`
        UPDATE users.course_progress
        SET
          is_selected_for_assignment = true,
          affected_assignment_id = ${assignment.id},
          last_updated = NOW()
        WHERE uid = ANY(${studentUids})
        AND course_id = ${courseId};
      `);
  }

  console.log('[Assign single assignment] === END');
};

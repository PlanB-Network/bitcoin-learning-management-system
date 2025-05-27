import { firstRow, sql } from '@blms/database';
import type { Dependencies } from '#src/dependencies.js';

// For mainnet
// const bizSchoolCourseId = 'c762773a-9017-4129-bc0e-06adf86050ef';
// const bizSchoolMidTermChapterId = '6065ea4e-2675-11f0-b6ab-bb5e1522cb78';
// const bizSchoolFinalExamChapterId = '9a307a50-2675-11f0-a893-57c148082c1f';

// For testnet biz999
const bizSchoolCourseId = '576ac496-a4fd-471a-b022-e0da1ab89a29';
const bizSchoolMidTermChapterId = '6428d1d7-9f8e-420e-8bdf-83077de1895c';
const bizSchoolFinalExamChapterId = 'eaf5a2fa-9418-4eb0-bbed-25a1d9461b3d';

export const createSelectBizSchoolStudentsForAssignments = ({
  postgres,
}: Dependencies) => {
  return postgres.exec(sql`
    WITH top100 AS (
      SELECT
        uid,
        COALESCE(MAX(CASE WHEN chapter_id = ${bizSchoolMidTermChapterId} THEN score END), 0)
        + 2 * COALESCE(MAX(CASE WHEN chapter_id = ${bizSchoolFinalExamChapterId} THEN score END), 0)
          AS new_score
      FROM users.exam_attempts
      WHERE chapter_id IN (
        ${bizSchoolMidTermChapterId},
        ${bizSchoolFinalExamChapterId}
      )
      GROUP BY uid
      ORDER BY new_score DESC
      LIMIT 100
    )
    UPDATE users.course_progress cp
    SET is_selected_for_assignment = true
    FROM top100 t
    WHERE cp.uid = t.uid AND cp.course_id = ${bizSchoolCourseId};
  `);
};

interface StudentWithScore {
  uid: string;
  newScore: number;
}

interface UserCourseProgress {
  appliedAssignmentIds: string[];
}

export const createAffectProjectToBizSchoolStudents = async ({
  postgres,
}: Dependencies) => {
  console.log('[AffectProjects] === START');

  const MAX_STUDENTS_PER_ASSIGNMENT = 5;

  const students = await postgres.exec(sql<StudentWithScore[]>`
    SELECT
      cp.uid,
      COALESCE(MAX(CASE WHEN chapter_id = ${bizSchoolMidTermChapterId} THEN score END), 0)
      + 2 * COALESCE(MAX(CASE WHEN chapter_id = ${bizSchoolFinalExamChapterId} THEN score END), 0)
        AS new_score
    FROM users.exam_attempts
    JOIN users.course_progress cp ON cp.uid = exam_attempts.uid
    WHERE cp.is_selected_for_assignment = true
    AND cp.course_id = ${bizSchoolCourseId}
    GROUP BY cp.uid
    ORDER BY new_score DESC;
  `);

  console.log('[AffectProjects] Students : ', students);

  const assignmentApplications: Record<string, Set<string>> = {};

  // Loop through each student, starting with the best grades
  for (const student of students) {
    console.log(
      `[AffectProjects] Processing student ${student.uid} with score ${student.newScore}`,
    );

    const userProgress = await postgres
      .exec(sql<UserCourseProgress[]>`
        SELECT applied_assignment_ids
        FROM users.course_progress
        WHERE uid = ${student.uid}
          AND course_id = ${bizSchoolCourseId}
        LIMIT 1;
      `)
      .then(firstRow);

    console.log('[AffectProjects] userProgress', userProgress);

    if (!userProgress) {
      console.log(
        `[AffectProjects] WARNING: no applied assignments found for student ${student.uid}`,
      );
      continue;
    }

    for (const appliedAssignmentId of userProgress.appliedAssignmentIds) {
      if (!assignmentApplications[appliedAssignmentId]) {
        assignmentApplications[appliedAssignmentId] = new Set();
      }

      if (
        assignmentApplications[appliedAssignmentId].size <
        MAX_STUDENTS_PER_ASSIGNMENT
      ) {
        assignmentApplications[appliedAssignmentId].add(student.uid);
        console.log(
          `[AffectProjects] Assigned student ${student.uid} to assignment ${appliedAssignmentId}`,
        );

        await postgres.exec(sql`
          UPDATE users.course_progress
          SET affected_assignment_id = ${appliedAssignmentId}
          WHERE uid = ${student.uid}
          AND course_id = ${bizSchoolCourseId};
        `);

        break; // Move to the next student
      }
      console.log(
        '[AffectProjects] Assignment already has 5 students assigned:',
        appliedAssignmentId,
      );
    }
  }
};

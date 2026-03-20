import { firstRow, sql } from '@blms/database';
import type { CourseAssignment } from '@blms/types';
import type { Dependencies } from '#src/dependencies.js';

export const createSelectBizSchoolStudentsForAssignments = ({
  postgres,
}: Dependencies) => {
  return (courseId: string, topStudentsLimit: number) =>
    postgres.exec(sql`
    WITH exam_chapters AS (
      SELECT DISTINCT ON (cc.chapter_id)
        cc.chapter_id,
        ccl.start_date
      FROM content.course_chapters cc
      JOIN content.course_chapters_localized ccl ON ccl.chapter_id = cc.chapter_id
      WHERE cc.course_id = ${courseId}
        AND ccl.is_single_trial_exam = true
      ORDER BY cc.chapter_id, ccl.start_date
    ),
    ranked_exams AS (
      SELECT
        chapter_id,
        ROW_NUMBER() OVER (ORDER BY start_date ASC NULLS LAST) AS exam_rank,
        COUNT(*) OVER () AS total_exams
      FROM exam_chapters
    ),
    student_scores AS (
      SELECT
        ea.uid,
        re.chapter_id,
        MAX(ea.score) AS best_score,
        MAX(re.exam_rank) AS exam_rank,
        MAX(re.total_exams) AS total_exams
      FROM users.exam_attempts ea
      JOIN ranked_exams re ON re.chapter_id = ea.chapter_id
      GROUP BY ea.uid, re.chapter_id
    ),
    top_students AS (
      SELECT
        uid,
        SUM(best_score * CASE WHEN exam_rank < total_exams THEN 1 ELSE 3 END) AS new_score
      FROM student_scores
      GROUP BY uid
      ORDER BY new_score DESC
      LIMIT ${process.env.NODE_ENV === 'testnet' ? 6 : topStudentsLimit}
    )
    UPDATE users.course_progress cp
    SET is_selected_for_assignment = true
    FROM top_students t
    WHERE cp.uid = t.uid AND cp.course_id = ${courseId};
  `);
};

interface StudentWithScore {
  uid: string;
  newScore: number;
}

interface UserCourseProgress {
  appliedAssignmentIds: string[];
}

export const createAffectProjectToBizSchoolStudents = ({
  postgres,
}: Dependencies) => {
  return async (courseId: string, maxStudentsPerAssignment: number) => {
    console.log('[AffectProjects] === START');

    const assignmentApplications: Record<string, Set<string>> = {};
    const notAssignedUids: string[] = [];

    const students = await postgres.exec(sql<StudentWithScore[]>`
    WITH exam_chapters AS (
      SELECT DISTINCT ON (cc.chapter_id)
        cc.chapter_id,
        ccl.start_date
      FROM content.course_chapters cc
      JOIN content.course_chapters_localized ccl ON ccl.chapter_id = cc.chapter_id
      WHERE cc.course_id = ${courseId}
        AND ccl.is_single_trial_exam = true
      ORDER BY cc.chapter_id, ccl.start_date
    ),
    ranked_exams AS (
      SELECT
        chapter_id,
        ROW_NUMBER() OVER (ORDER BY start_date ASC NULLS LAST) AS exam_rank,
        COUNT(*) OVER () AS total_exams
      FROM exam_chapters
    ),
    student_scores AS (
      SELECT
        ea.uid,
        re.chapter_id,
        MAX(ea.score) AS best_score,
        MAX(re.exam_rank) AS exam_rank,
        MAX(re.total_exams) AS total_exams
      FROM users.exam_attempts ea
      JOIN ranked_exams re ON re.chapter_id = ea.chapter_id
      JOIN users.course_progress cp ON cp.uid = ea.uid
      WHERE cp.is_selected_for_assignment = true
        AND cp.course_id = ${courseId}
      GROUP BY ea.uid, re.chapter_id
    )
    SELECT
      uid,
      SUM(best_score * CASE WHEN exam_rank < total_exams THEN 1 ELSE 3 END) AS new_score
    FROM student_scores
    GROUP BY uid
    ORDER BY new_score DESC;
  `);

    console.log('[AffectProjects] Students : ', students);

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
          AND course_id = ${courseId}
        LIMIT 1;
      `)
        .then(firstRow);

      console.log('[AffectProjects] userProgress', userProgress);

      if (!userProgress?.appliedAssignmentIds) {
        notAssignedUids.push(student.uid);
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
          maxStudentsPerAssignment
        ) {
          assignmentApplications[appliedAssignmentId].add(student.uid);
          console.log(
            `[AffectProjects] Assigned student ${student.uid} to assignment ${appliedAssignmentId}`,
          );

          await postgres.exec(sql`
          UPDATE users.course_progress
          SET affected_assignment_id = ${appliedAssignmentId}
          WHERE uid = ${student.uid}
          AND course_id = ${courseId};
        `);

          break; // Move to the next student
        }
        console.log(
          `[AffectProjects] Assignment already has ${maxStudentsPerAssignment} students assigned:`,
          appliedAssignmentId,
        );
      }
    }

    const assignments = await postgres.exec(
      sql<CourseAssignment[]>`
    SELECT
      ca.*
    FROM content.course_assignment ca
    WHERE ca.course_id = ${courseId}
    ORDER BY ca.name ASC`,
    );

    console.log('[AffectProjects] All assignments count:', assignments.length);

    for (const uid of notAssignedUids) {
      console.log(
        `[AffectProjects] No applied assignments found for student ${uid}, assigning to available assignments`,
      );

      for (const assignment of assignments) {
        if (!assignmentApplications[assignment.id]) {
          assignmentApplications[assignment.id] = new Set();
        }

        if (
          assignmentApplications[assignment.id].size < maxStudentsPerAssignment
        ) {
          assignmentApplications[assignment.id].add(uid);

          console.log(
            `[AffectProjects] Assigned student ${uid} to assignment ${assignment.id}`,
          );

          await postgres.exec(sql`
          UPDATE users.course_progress
          SET affected_assignment_id = ${assignment.id}
          WHERE uid = ${uid}
          AND course_id = ${courseId};
        `);

          break;
        }
      }
    }

    console.log('[AffectProjects] === END');
  };
};

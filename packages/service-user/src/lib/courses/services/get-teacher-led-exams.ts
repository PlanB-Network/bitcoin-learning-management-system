import { sql } from '@blms/database';
import type { CourseWithSingleTrialExamsGradesAndSummary } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import {
  getAllAssignmentsGradesQuery,
  getAllSingleTrialExamsGradesQuery,
} from '../queries/get-teacher-led-exams.js';

interface Options {
  courseId: string;
  passingThreshold: number;
}

export const createGetTeacherLedCourseGrades = ({ postgres }: Dependencies) => {
  return async (
    options: Options,
  ): Promise<CourseWithSingleTrialExamsGradesAndSummary> => {
    const examsGrades = await postgres.exec(
      getAllSingleTrialExamsGradesQuery(options.courseId),
    );

    const assignmentGrades = await postgres.exec(
      getAllAssignmentsGradesQuery(options.courseId),
    );

    const averageAndMedianTotalScore = await postgres.exec(
      sql<{ average: number }[]>`
          SELECT
            AVG(total_score) as average
          FROM users.course_progress
          WHERE course_id = ${options.courseId};
        `,
    );

    const graduatedStudentsAmount = await postgres.exec(
      sql<{ count: number }[]>`
            SELECT
                COUNT(*) AS count
            FROM users.course_progress
            WHERE course_id = ${options.courseId}
            AND total_score >= ${options.passingThreshold};
        `,
    );

    return {
      examsGrades,
      assignmentGrades,
      averageTotalScore: averageAndMedianTotalScore[0].average,
      graduatedStudentsAmount: graduatedStudentsAmount[0].count,
    };
  };
};

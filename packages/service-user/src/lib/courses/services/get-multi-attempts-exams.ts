import { sql } from '@blms/database';
import type { CourseWithMultiAttemptsExamGradesAndSummary } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getAllExamsGradesQuery } from '../queries/get-exams-grades.js';

interface Options {
  courseId: string;
  passingThreshold: number;
}

export const createGetMultiAttemptsExamCourseGrades = ({
  postgres,
}: Dependencies) => {
  return async (
    options: Options,
  ): Promise<CourseWithMultiAttemptsExamGradesAndSummary> => {
    const examsGrades = await postgres.exec(
      getAllExamsGradesQuery(options.courseId, false),
    );

    const averageScore = await postgres.exec(
      sql<{ average: number }[]>`
          SELECT
            AVG(score) as average
          FROM users.exam_attempts
          WHERE course_id = ${options.courseId};
        `,
    );

    const graduatedStudentsAmount = examsGrades.filter(
      (grade) =>
        grade.score !== null && grade.score >= options.passingThreshold,
    ).length;

    const totalStudentsTakingExam = examsGrades.filter(
      (grade, index, array) =>
        array.findIndex((g) => g.uid === grade.uid) === index,
    ).length;

    return {
      examsGrades,
      averageScore: averageScore.length ? averageScore[0].average : 0,
      graduatedStudentsAmount,
      totalStudentsTakingExam,
    };
  };
};

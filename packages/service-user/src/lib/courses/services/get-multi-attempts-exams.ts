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
      sql<{ average: number | null }[]>`
          SELECT
            AVG(score) as average
          FROM users.exam_attempts
          WHERE course_id = ${options.courseId}
            AND finalized = true;
        `,
    );

    const graduatedStudentsAmount = new Set(
      examsGrades
        .filter(
          (grade) =>
            grade.score !== null && grade.score >= options.passingThreshold,
        )
        .map((grade) => grade.uid),
    ).size;

    const totalStudentsTakingExam = examsGrades.filter(
      (grade, index, array) =>
        array.findIndex((g) => g.uid === grade.uid) === index,
    ).length;

    const formattedAverageScore = averageScore[0]?.average ?? 0;

    return {
      examsGrades,
      averageScore: formattedAverageScore,
      graduatedStudentsAmount,
      totalStudentsTakingExam,
    };
  };
};

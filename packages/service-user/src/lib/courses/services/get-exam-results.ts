import { sql } from '@blms/database';
import type { CourseExamResults, UserExamTimestamp } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import {
  getAllUserCourseExamsResultsQuery,
  getExamResultsQuery,
  getLatestExamAttemptIdQuery,
} from '../queries/get-exam.js';

interface Options {
  uid: string;
  courseId: string;
}

export const createGetLatestExamResults = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<CourseExamResults> => {
    const lastExamId = await postgres.exec(
      getLatestExamAttemptIdQuery(options),
    );

    return postgres
      .exec(getExamResultsQuery({ examId: lastExamId[0].id }))
      .then((result) => result[0]);
  };
};

export const createGetAllUserCourseExamsResults = ({
  postgres,
}: Dependencies) => {
  return async (options: Options): Promise<CourseExamResults[]> => {
    const examResults = await postgres.exec(
      getAllUserCourseExamsResultsQuery(options),
    );

    const examAttemptIds = examResults.map((exam) => exam.id);

    const examTimestamps = await postgres.exec(
      sql<UserExamTimestamp[]>`
          SELECT * FROM users.exam_timestamps
          WHERE exam_attempt_id = ANY(${examAttemptIds});
        `,
    );

    const timestampMap: Record<string, UserExamTimestamp> = {};

    for (const timestamp of examTimestamps) {
      timestampMap[timestamp.examAttemptId] = timestamp;
    }

    return examResults.map((exam) => {
      const timestamp = timestampMap[exam.id];

      return {
        ...exam,
        isTimestamped: !!timestamp?.confirmed || false,
        pdfKey: timestamp?.pdfKey || undefined,
        imgKey: timestamp?.imgKey || undefined,
      };
    });
  };
};

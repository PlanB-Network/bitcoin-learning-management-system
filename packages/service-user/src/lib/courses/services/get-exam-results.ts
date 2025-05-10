import { sql } from '@blms/database';
import type { CourseExamResults, UserExamTimestamp } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import {
  getAllUserCourseExamsResultsQuery,
  getExamResultsQuery,
  getLatestExamAttemptIdQuery,
} from '../queries/get-exam-questions.js';

interface Options {
  uid: string;
  courseId: string;
}

export const createGetLatestExamResults = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<CourseExamResults | null> => {
    const lastExam = (
      await postgres.exec(getLatestExamAttemptIdQuery(options))
    ).at(0);

    if (!lastExam) {
      return null;
    }

    const [examResult] = await postgres.exec(
      getExamResultsQuery({ examId: lastExam.id }),
    );

    // TODO SINGLE TRIAL
    // if (examResult.type === 'singleTrial') {
    //   const now = new Date();
    //   if (examResult.dueTo < new Date(now.getTime() + 5 * 60 * 1000)) {
    //     examResult.finalized = true;
    //   }
    // }

    const examTimestamps = await postgres.exec(
      sql<UserExamTimestamp[]>`
          SELECT * FROM users.exam_timestamps
          WHERE exam_attempt_id = ${lastExam.id};
        `,
    );

    const timestamp = examTimestamps[0];

    return {
      ...examResult,
      isTimestamped: !!timestamp?.confirmed || false,
      pdfKey: timestamp?.pdfKey || undefined,
      imgKey: timestamp?.imgKey || undefined,
    };
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

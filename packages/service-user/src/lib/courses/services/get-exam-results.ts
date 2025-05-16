import { firstRow, sql } from '@blms/database';
import type {
  CourseExamResults,
  CourseExamResultsExtended,
  UserExamTimestamp,
} from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import {
  getAllUserCourseExamsResultsQuery,
  getExamResultsQuery,
  getLatestExamAttemptIdQuery,
} from '../queries/get-exam-questions.js';

interface Options {
  uid: string;
  courseId: string;
  chapterId: string | undefined;
}

export const createGetLatestExamResults = ({ postgres }: Dependencies) => {
  return async (
    options: Options,
  ): Promise<CourseExamResultsExtended | null> => {
    const lastExam = (
      await postgres.exec(getLatestExamAttemptIdQuery(options))
    ).at(0);

    if (!lastExam) {
      return null;
    }

    const examResult = await postgres
      .exec(getExamResultsQuery({ examId: lastExam.id }))
      .then(firstRow);

    if (!examResult) {
      return null;
    }

    const examTimestamps = await postgres.exec(
      sql<UserExamTimestamp[]>`
          SELECT * FROM users.exam_timestamps
          WHERE exam_attempt_id = ${lastExam.id};
        `,
    );

    const timestamp = examTimestamps[0];

    const totalGoodUserAnswer = examResult.questions.reduce(
      (acc, question) =>
        acc +
        (question.userAnswer ===
        question.answers.find((ans) => ans.correctAnswer)?.order
          ? 1
          : 0),
      0,
    );

    const totalWrongUserAnswer = examResult.questions.reduce(
      (acc, question) =>
        acc +
        (question.userAnswer !== null &&
        question.userAnswer !==
          question.answers.find((ans) => ans.correctAnswer)?.order
          ? 1
          : 0),
      0,
    );

    const totalAnsweredAnswers = examResult.questions.reduce(
      (acc, question) => acc + (question.userAnswer === null ? 0 : 1),
      0,
    );

    const userExamDuration =
      examResult.finishedAt && examResult.startedAt
        ? Math.floor(
            (new Date(examResult.finishedAt).getTime() -
              new Date(examResult.startedAt).getTime()) /
              1000,
          )
        : 0;

    return {
      ...examResult,
      isTimestamped: !!timestamp?.confirmed || false,
      pdfKey: timestamp?.pdfKey || undefined,
      imgKey: timestamp?.imgKey || undefined,
      totalGoodUserAnswer,
      totalWrongUserAnswer,
      totalAnsweredAnswers,
      userExamDuration,
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

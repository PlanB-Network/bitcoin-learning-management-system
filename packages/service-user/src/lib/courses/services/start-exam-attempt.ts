import { ExamType } from '@blms/constants';
import type { PartialExamQuestion } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getExamInfo } from '../queries/get-exam-info.js';
import { getPartialExamQuestionsQuery } from '../queries/get-exam-questions.js';
import {
  insertCourseExamQuestionsQuery,
  insertExamAttemptQuery,
  insertSingleTrialExamQuestionsQuery,
} from '../queries/insert-exam-attempt.js';

interface Options {
  uid: string;
  courseId: string;
  chapterId: string;
  language: string;
  examType: ExamType;
}

export const createStartExamAttempt = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<PartialExamQuestion[]> => {
    if (options.examType === ExamType.SingleTrial) {
      const now = new Date();
      const [examInfo] = await postgres.exec(
        getExamInfo({
          chapterId: options.chapterId,
          language: options.language,
        }),
      );

      if (examInfo.startDate && examInfo.endDate) {
        if (now.getTime() < examInfo.startDate.getTime()) {
          throw new Error('Exam have not yes started.');
        }

        if (now.getTime() > examInfo.endDate.getTime()) {
          throw new Error('Exam is over');
        }
      }
    }

    const examId = await postgres
      .exec(insertExamAttemptQuery(options))
      .then((result) => result[0].id);

    if (options.examType === ExamType.Final) {
      await postgres.exec(
        insertCourseExamQuestionsQuery({
          courseId: options.courseId,
          examId,
          language: options.language,
        }),
      );
    } else {
      if (options.chapterId) {
        await postgres.exec(
          insertSingleTrialExamQuestionsQuery({
            chapterId: options.chapterId,
            courseId: options.courseId,
            examId,
            language: options.language,
          }),
        );
      } else {
        console.error('Chapter id missing in createStartExamAttempt');
      }
    }

    return postgres.exec(
      getPartialExamQuestionsQuery({ examId, language: options.language }),
    );
  };
};

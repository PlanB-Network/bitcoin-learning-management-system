import type { PartialExamQuestion } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getPartialExamQuestionsQuery } from '../queries/get-exam.js';
import {
  insertExamAttemptQuery,
  insertExamQuestionsQuery,
} from '../queries/insert-exam-attempt.js';

interface Options {
  uid: string;
  courseId: string;
  language: string;
}

export const createStartExamAttempt = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<PartialExamQuestion[]> => {
    const examId = await postgres
      .exec(insertExamAttemptQuery(options))
      .then((result) => result[0].id);

    await postgres.exec(
      insertExamQuestionsQuery({
        examId,
        courseId: options.courseId,
        language: options.language,
      }),
    );

    return postgres.exec(
      getPartialExamQuestionsQuery({ examId, language: options.language }),
    );
  };
};

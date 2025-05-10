import type { PartialExamQuestion } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getPartialExamQuestionsQuery } from '../queries/get-exam-questions.js';

interface Options {
  examId: string;
  language: string;
}

export const createGetExamQuestions = ({ postgres }: Dependencies) => {
  return async ({
    examId,
    language,
  }: Options): Promise<PartialExamQuestion[]> => {
    const exam = await postgres.exec(
      getPartialExamQuestionsQuery({ examId, language }),
    );

    return exam;
  };
};

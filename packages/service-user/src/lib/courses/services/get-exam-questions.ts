import type { ExamQuestionStatistics, PartialExamQuestion } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import {
  getExamQuestionStatisticsQuery,
  getPartialExamQuestionsQuery,
} from '../queries/get-exam-questions.js';

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

export const createGetSingleTrialExamQuestionStatistics = ({
  postgres,
}: Dependencies) => {
  return async (chapterId: string): Promise<ExamQuestionStatistics[]> => {
    return postgres.exec(getExamQuestionStatisticsQuery({ chapterId }));
  };
};

export const createGetMultiAttemptsExamQuestionStatistics = ({
  postgres,
}: Dependencies) => {
  return async (courseId: string): Promise<ExamQuestionStatistics[]> => {
    return postgres.exec(getExamQuestionStatisticsQuery({ courseId }));
  };
};

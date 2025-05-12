import type { CourseExamInfo } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getExamInfo } from '../queries/get-exam-info.js';

interface Options {
  chapterId: string;
  language: string;
}

export const createGetExamInfo = ({ postgres }: Dependencies) => {
  return async ({ chapterId, language }: Options): Promise<CourseExamInfo> => {
    const [exam] = await postgres.exec(getExamInfo({ chapterId, language }));

    return {
      nbQuestions: exam.nbQuestions,
    };
  };
};

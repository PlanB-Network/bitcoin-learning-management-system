import type { CourseSucceededExam } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getAllUserSucceededExamsQuery } from '../queries/get-exam-questions.js';

interface Options {
  uid: string;
  language: string;
}

export const createGetAllSucceededUserExams = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<CourseSucceededExam[]> => {
    return postgres.exec(getAllUserSucceededExamsQuery(options));
  };
};

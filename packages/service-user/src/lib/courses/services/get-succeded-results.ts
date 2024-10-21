import type { CourseSuccededExam } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getAllUserSuccededExamsQuery } from '../queries/get-exam.js';

interface Options {
  uid: string;
  language: string;
}

export const createGetAllSuccededUserExams = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<CourseSuccededExam[]> => {
    return postgres.exec(getAllUserSuccededExamsQuery(options));
  };
};

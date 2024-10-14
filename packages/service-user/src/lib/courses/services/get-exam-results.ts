import type { CourseExamResults } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import {
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

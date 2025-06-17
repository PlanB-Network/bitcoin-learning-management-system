import { firstRow } from '@blms/database';
import type { Dependencies } from '../../../dependencies.js';
import { getEnrolledStudentsCount } from '../queries/get-enrolled-students.js';

interface Options {
  courseId: string;
}

export const createGetEnrolledStudentsCount = ({ postgres }: Dependencies) => {
  return async (options: Options): Promise<number> => {
    const result = await postgres
      .exec(getEnrolledStudentsCount(options.courseId))
      .then(firstRow);

    return result?.enrolledStudentsCount || 0;
  };
};

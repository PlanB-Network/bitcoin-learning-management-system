import { firstRow } from '@blms/database';
import type { CourseReview } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { getCourseReview } from '../queries/get-course-review.js';

interface Options {
  uid: string;
  courseId: string;
}

export const createGetCourseReview = ({ postgres }: Dependencies) => {
  return async ({ uid, courseId }: Options): Promise<CourseReview | null> => {
    const courseReview = await postgres
      .exec(getCourseReview(uid, courseId))
      .then(firstRow);

    if (!courseReview) {
      return null;
    }

    return courseReview;
  };
};

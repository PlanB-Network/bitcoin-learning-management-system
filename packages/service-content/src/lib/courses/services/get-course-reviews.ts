import { firstRow, rejectOnEmpty } from '@blms/database';
import type { CourseReviewsExtended } from '@blms/types';

import type { Dependencies } from '#src/lib/dependencies.js';

import { getCourseReviewsQuery } from '../queries/get-course-reviews.js';

export const createGetCourseReviews = ({ postgres }: Dependencies) => {
  return (courseId: string): Promise<CourseReviewsExtended> => {
    return postgres
      .exec(getCourseReviewsQuery(courseId))
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};

import { firstRow, rejectOnEmpty } from '@blms/database';
import type { CourseReviewsExtended } from '@blms/types';

import type { Dependencies } from '#src/lib/dependencies.js';

import {
  getPublicCourseReviewsQuery,
  getTeacherCourseReviewsQuery,
} from '../queries/get-course-reviews.js';

export const createGetPublicCourseReviews = ({ postgres }: Dependencies) => {
  return (courseId: string): Promise<CourseReviewsExtended | undefined> => {
    return postgres.exec(getPublicCourseReviewsQuery(courseId)).then(firstRow);
  };
};

export const createGetTeacherCourseReviews = ({ postgres }: Dependencies) => {
  return (courseId: string): Promise<CourseReviewsExtended> => {
    return postgres
      .exec(getTeacherCourseReviewsQuery(courseId))
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};

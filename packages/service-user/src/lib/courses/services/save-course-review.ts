import type { CourseReview } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { saveCourseReview } from '../queries/save-course-review.js';

interface Options {
  newReview: CourseReview;
}

export const createSaveCourseReview = ({ postgres }: Dependencies) => {
  return (options: Options): Promise<CourseReview[]> => {
    return postgres.exec(saveCourseReview(options));
  };
};

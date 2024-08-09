import { firstRow } from '@blms/database';

import type { Dependencies } from '../../../dependencies.js';
import { getCourseReview } from '../queries/get-course-review.js';

export const createGetCourseReview =
  (dependencies: Dependencies) =>
  async ({ uid, courseId }: { uid: string; courseId: string }) => {
    const { postgres } = dependencies;

    const courseReview = await postgres
      .exec(getCourseReview(uid, courseId))
      .then(firstRow);

    if (!courseReview) {
      return null;
    }

    return courseReview;
  };

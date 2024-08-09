import type { CourseReview } from '@blms/types';

import type { Dependencies } from '../../../dependencies.js';
import { saveCourseReview } from '../queries/save-course-review.js';

export const createSaveCourseReview =
  (dependencies: Dependencies) =>
  async ({ newReview }: { newReview: CourseReview }) => {
    const { postgres } = dependencies;

    await postgres.exec(
      saveCourseReview({
        newReview,
      }),
    );
  };

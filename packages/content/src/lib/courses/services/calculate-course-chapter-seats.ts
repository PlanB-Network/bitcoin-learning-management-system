import type { Dependencies } from '../../dependencies.js';
import { calculateCourseChapterSeats } from '../queries/calculate-course-chapter-seats.js';

export const createCalculateCourseChapterSeats =
  (dependencies: Dependencies) => async () => {
    const { postgres } = dependencies;

    await postgres.exec(calculateCourseChapterSeats());
  };

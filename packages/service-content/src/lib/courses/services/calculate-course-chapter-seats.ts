import type { Dependencies } from '../../dependencies.js';
import { calculateCourseChapterSeats } from '../queries/calculate-course-chapter-seats.js';

export const createCalculateCourseChapterSeats = ({
  postgres,
}: Dependencies) => {
  return () => {
    return postgres.exec(calculateCourseChapterSeats());
  };
};

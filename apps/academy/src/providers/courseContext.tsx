import type { CourseProgressExtended, CourseResponse } from '@blms/types';
import { createContext, useContext } from 'react';

export type CourseContextValue = {
  course: CourseResponse | null;
  courseProgress: CourseProgressExtended[] | undefined;
  isLoggedIn: boolean;
  isCoursePaid: boolean | undefined;
};

export const CourseContext = createContext<CourseContextValue>({
  course: null,
  courseProgress: undefined,
  isLoggedIn: false,
  isCoursePaid: undefined,
});

export const useCourse = () => useContext(CourseContext);

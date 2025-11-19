import type { CourseProgressExtended, CourseResponse } from '@blms/types';
import { createContext, useContext } from 'react';

export type CourseContextValue = {
  course: CourseResponse | null;
  courseProgress: CourseProgressExtended[] | undefined;
  isLoggedIn: boolean;
};

export const CourseContext = createContext<CourseContextValue>({
  course: null,
  courseProgress: undefined,
  isLoggedIn: false,
});

export const useCourse = () => useContext(CourseContext);

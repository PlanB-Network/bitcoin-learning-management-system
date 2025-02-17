import type { JoinedCourse } from '@blms/types';

export const levels = ['beginner', 'intermediate', 'advanced', 'expert'];

export const sortCoursesByLevel = (courses: JoinedCourse[]) => {
  return courses.sort((a, b) => {
    return levels.indexOf(a.level) - levels.indexOf(b.level);
  });
};

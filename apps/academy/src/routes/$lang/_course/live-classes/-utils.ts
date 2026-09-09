import type { JoinedCourse } from '@blms/types';

type PlanbSchoolCourse = Pick<
  JoinedCourse,
  'endDate' | 'isArchived' | 'isPlanbSchool'
>;

export const findActivePlanbSchoolCourse = <Course extends PlanbSchoolCourse>(
  courses: Course[],
  now = new Date(),
) =>
  courses.find(
    (course) =>
      course.isArchived === false &&
      course.isPlanbSchool === true &&
      (!course.endDate || course.endDate.getTime() > now.getTime()),
  );

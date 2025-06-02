import type { Dependencies } from '#src/dependencies.js';
import { getScheduledCourseAnnouncementsQuery } from '../queries/get-scheduled-course-announcements.js';

interface Options {
  courseId: string;
  isPublishedOnly?: boolean;
  isProfessor?: boolean;
}

export const createGetScheduledCourseAnnouncements = ({
  postgres,
}: Dependencies) => {
  return async ({
    courseId,
    isPublishedOnly = true,
    isProfessor = false,
  }: Options) => {
    const announcements = await postgres.exec(
      getScheduledCourseAnnouncementsQuery({
        courseId,
        isPublishedOnly,
        isProfessor,
      }),
    );
    return announcements;
  };
};

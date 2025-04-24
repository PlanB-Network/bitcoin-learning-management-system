import type { Dependencies } from '#src/dependencies.js';
import { getScheduledCourseAnnouncementsQuery } from '../queries/get-scheduled-course-announcements.js';

interface Options {
  courseId: string;
  isPublishedOnly?: boolean;
}

export const createGetScheduledCourseAnnouncements = ({
  postgres,
}: Dependencies) => {
  return async ({ courseId, isPublishedOnly = true }: Options) => {
    const announcements = await postgres.exec(
      getScheduledCourseAnnouncementsQuery({ courseId, isPublishedOnly }),
    );
    return announcements;
  };
};
